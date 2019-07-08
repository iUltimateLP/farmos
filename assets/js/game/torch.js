/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: torch.js
    Purpose: Torch Game Object
*/

const SOUND_ATTENUATION_RADIUS = 300;

class Torch {
    // Default constructor
    constructor(x, y) {
        // We use the update event for attenuation
        window.game.events.on("update", this.update, this);

        // Store the position
        this.x = x;
        this.y = y;

        this.state = false;

        // Start preloading the assets
        this.preload(window.game.scene);
    }

    // Called when the game preloads assets for later use
    preload(scene) {
        // Register a complete handler for the game loader
        scene.load.once("complete", function() {
            this.create(scene);
        }, this);

        // Queue up the spritesheet for torches
        scene.load.spritesheet("torch", "assets/img/objects/torch.png", {
            frameWidth: 32,
            frameHeight: 32
        });

        // Load the torch sound file
        scene.load.audio("torch", "assets/sound/torch.wav");

        // Start loading
        scene.load.start();
    }

    // Called when the game creates this object and places it on screen
    create(scene) {
        // Add the torch sprite to screen
        this.sprite = scene.add.sprite(this.x, this.y, "torch");

        // Scale it
        this.sprite.displayWidth = 96;
        this.sprite.displayHeight = 96;

        this.sprite.depth = CONSTANTS.LAYERS.OBJECTS;

        // Create an animation out of the spritesheet
        scene.anims.create({
            key: "torch_burn",
            frames: scene.anims.generateFrameNumbers("torch", {
                start: 1,
                end: 8
            }),
            frameRate: 6,
            repeat: -1
        });

        // Play the animation
        this.sprite.anims.play("torch_burn");

        // Create the light component responsible for lighting up the scene
        this.light = window.game.scene.lights.addLight(this.x, this.y - 20, 200);
        this.light.setColor(0xffd27f);
        this.light.setIntensity(0.5);

        // This creates an ellipse which is the source for the light flicker animation
        this.ellipse = new Phaser.Geom.Ellipse(this.light.x, this.light.y, 30, 30);

        // Every 100ms, the Ellipse.Random function will find a random point in the ellipse, and apply
        // the coordinates of that point to the light, resulting in a nice flicker effect.
        window.game.scene.time.addEvent({
            delay: 100,
            callback: function() {
                Phaser.Geom.Ellipse.Random(this.ellipse, this.light);
            },
            callbackScope: this,
            repeat: -1
        });

        // Push the newly created object to the global stack of objects
        window.game.objects.push(this);

        // Update the post process' camera filter for filtering these out of the UI cam
        window.game.postprocess.updateCameraFilter();

        // Register two event handlers for the time system, so this torch can turn on/off depending on the time of day
        window.game.time.events.on("night", function() {
            this.setState(true);
        }.bind(this));

        window.game.time.events.on("morning", function() {
            this.setState(false);
        }.bind(this));

        // Initially turn the torches off
        this.setState(false);

        // Create the audio for the torch
        this.torchAudio = scene.sound.add("torch");
        this.torchAudio.setLoop(true);
        this.torchAudio.setVolume(0);
        this.torchAudio.play();
    }

    // Turns this torch on or off
    setState(state) {
        // Remember the state
        this.state = state;

        // Update the light's intensity
        this.light.setIntensity(state ? 0.5 : 0);

        // Update the torch's animation
        if (state) {
            this.sprite.anims.play("torch_burn");
        } else {
            this.sprite.anims.stop();
            this.sprite.setFrame(0);
        }
    }

    // Called every Phaser tick
    update(scene, time, delta) {
        var distX = window.game.player.getPosition().x - this.x;
        var distY = window.game.player.getPosition().y - this.y;

        // Pythagoras Theorem a² + b² = c²
        var dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));

        if (this.torchAudio) {
            if (dist >= SOUND_ATTENUATION_RADIUS || !this.state) {
                this.torchAudio.setVolume(0);
            } else if (dist < SOUND_ATTENUATION_RADIUS && this.state) {
                // Since the radius is SOUND_ATTENUATION_RADIUS, we will map the distance 0..SOUND_ATTENUATION_RADIUS to 0..1 for the volume
                // Also, we substract from 1 to invert it, since the middle will have the loudest volume
                var volume = 1.0 - (dist / SOUND_ATTENUATION_RADIUS);

                this.torchAudio.setVolume(volume);
            }
        }
    }
}
