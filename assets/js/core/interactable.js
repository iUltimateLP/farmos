/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: interactable.js
    Purpose: Interactable objects in the scene - have a sprite as visual representation, can be interacted with using mouse
*/

class Interactable {
    // Default constructor
    constructor(x, y, interactableTemplate) {
        // Store the constructor variables
        this.x = x;
        this.y = y;
        this.template = interactableTemplate;

        // Start preloading the assets for this object
        this.preload(window.game.scene);

        // Holds all audio waves used by this interactable
        this.soundWaves = [];
    }

    // Called when the game preloads assets for later use
    preload(scene) {
        // Register a one-time event listener for when the loader completed loading the sprite for this object
        scene.load.once("complete", function() {
            // Create the object
            this.create(scene);
        }, this);

        // Add the spritesheet to the load queue
        scene.load.spritesheet(this.template.id, this.template.sprite, {
            frameWidth: this.template.frameWidth,
            frameHeight: this.template.framgeHeight
        });

        // Go through all sounds and load the audio files
        if (this.template.sounds) {
            this.template.sounds.forEach(function(sound, i) {
                // <id>_sound_<index> is what we use as a naming scheme
                scene.load.audio(this.template.id + "_sound_" + i, sound);
            }.bind(this));
        }

        // Start the loader
        scene.load.start();
    }

    // Called when the game creates this object and places it on screen
    create(scene) {
        // Create a new sprite using the freshly loaded image and add it to screen
        this.sprite = scene.add.sprite(this.x, this.y, this.template.id);
        this.sprite.setPipeline("Light2D");

        this.sprite.depth = CONSTANTS.LAYERS.OBJECTS;

        // Update the sprite's display size to match the template
        this.sprite.displayWidth = this.template.displayWidth;
        this.sprite.displayHeight = this.template.displayHeight;

        // Register a handler for when the user clicks on this sprite
        this.sprite.on("pointerup", function() {
            this.template.onInteract(this);
        }, this);

        // Register a handler for when the users mouse hovers over the sprite
        this.sprite.on("pointerover", function() {
            //console.log("hover");
        }, this);

        this.sprite.on("pointermove", function() {
            //console.log("out");
        })

        scene.input.on("pointerover", function() {
            //console.log("pointermove");
        })

        // Go through all sounds specified and add sound waves for them
        if (this.template.sounds) {
            this.template.sounds.forEach(function(sound, i) {
                // <id>_sound_<index> is what we use as a naming scheme
                var audio = scene.sound.add(this.template.id + "_sound_" + i);
                this.soundWaves.push(audio);
            }.bind(this));
        }

        // Enable interactivity so pointer events actually fire
        this.sprite.setInteractive();

        // Make the spritesheet lightable
        helpers.enableSpriteSheetLighting(this.sprite);

        // Push the newly created object to the global stack of objects
        window.game.objects.push(this);

        // This object should collide with the player
        window.game.scene.physics.add.collider(window.game.player.playerSprite, this.sprite);

        // Update the postprocess' camera filters, which hides this sprite from one of the cameras
        window.game.postprocess.updateCameraFilter();
    }

    // Sets a frame of this interactable
    setFrame(frame) {
        this.sprite.setFrame(frame);
    }

    // Plays an audio wave at a specified index
    playSound(index) {
        this.soundWaves[index].play();
    }

    // Called when the game wants to update this object (every tick)
    update(scene, time, delta) {

    }
}
