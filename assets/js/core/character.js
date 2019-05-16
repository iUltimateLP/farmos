/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: character.js
    Purpose: Base class for the character, handles movement, interaction, etc.
*/

class PlayableCharacter {
    // Default constructor
    constructor() {
        // Bind game events
        window.game.events.on("preload", this.preload, this);
        window.game.events.on("create", this.create, this);
        window.game.events.on("update", this.update, this);
    }

    // Called when the game preloads assets for later use
    preload(scene) {
        console.log("[Character] Initializing");

        // Load the character spritesheet
        scene.load.spritesheet("thanos-farmer", "assets/img/character/thanos-farmer.png", {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    // Called when the game creates this object and places it on screen
    create(scene) {
        // Add a new physics sprite to the scene
        this.player = scene.physics.add.sprite(100, 450, "thanos");

        // Scale the player to the game scale
        this.player.setScale(CONSTANTS.GAME_SCALE);
        
        // Set the player's depth (z-index) to it's layer
        this.player.depth = CONSTANTS.LAYERS.PLAYER;

        // The player should collide with world bounds
        this.player.setCollideWorldBounds(true);

        // Setup movement animations
        scene.anims.create({
            key: "front",
            frames: scene.anims.generateFrameNumbers('thanos-farmer', {
                start: 0,
                end: 7
            }),
            frameRate: 10
        });

        scene.anims.create({
            key: "left",
            frames: scene.anims.generateFrameNumbers('thanos-farmer', {
                start: 8,
                end: 15
            }),
            frameRate: 10
        });
    
        scene.anims.create({
            key: "right",
            frames: scene.anims.generateFrameNumbers('thanos-farmer', {
                start: 16,
                end: 23
            }),
            frameRate: 10
        });
    
        scene.anims.create({
            key: "back",
            frames: scene.anims.generateFrameNumbers('thanos-farmer', {
                start: 24,
                end: 31
            }),
            frameRate: 10
        });
    
        // At startup, play and stop the front animation and set to the first frame
        this.player.anims.play("front");
        this.player.anims.stop();
        this.player.setFrame(0);

        // Apply the new key mappings      
        this.cursors = scene.input.keyboard.addKeys(CONSTANTS.KEYS);
    }

    // Calculates a two dimensional vector containing the direction the player moves in
    getMovementVector() {
        var vector = {x: 0, y: 0};
    
        if (this.cursors.up.isDown)
            vector.y = vector.y - 1;
    
        if (this.cursors.down.isDown) 
            vector.y = vector.y + 1;
    
        if (this.cursors.left.isDown) 
            vector.x = vector.x - 1;
    
        if (this.cursors.right.isDown)
            vector.x = vector.x + 1;
    
        return vector;
    }

    // Called when the game wants to update this object (every tick)
    update(scene, time, delta) {
        // Calculate the movement vector
        var mvec = this.getMovementVector();

        // Set the player's velocity
        this.player.setVelocity(mvec.x*CONSTANTS.MOVEMENT_SPEED, mvec.y*CONSTANTS.MOVEMENT_SPEED);

        // Animation State Machine
        if (this.cursors.left.isDown)
            this.player.anims.play('left', true);
        else if (this.cursors.right.isDown)
            this.player.anims.play('right', true);
        else if (this.cursors.down.isDown)
            this.player.anims.play('front', true);
        else if (this.cursors.up.isDown)
            this.player.anims.play('back', true);
        else {
            this.player.anims.stop();
            this.player.setFrame(0);
        }
    }    
}
