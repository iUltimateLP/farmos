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

        // Create the player's inventory
        this.inventory = new Inventory(10);

        // Stores the player's cash and XP amount, we'll let him start with $250 and XP 0
        this.cash = 250;
        this.xp = 0;

        // Stores the XP level the player is on
        this.currentLevel = 0;

        // When unlocking items in the skill tree, they're stored here.
        this.unlockedItems = [];
    }

    // Called when the game preloads assets for later use
    preload(scene) {
        // Load the character spritesheet
        scene.load.spritesheet("thanos-farmer", "assets/img/character/thanos-farmer.png", {
            frameWidth: 32,
            frameHeight: 48
        });

        // Load the required soundwave
        scene.load.audio("cash", "assets/sound/cash.wav");
        scene.load.audio("unlock", "assets/sound/snap.wav");
        scene.load.audio("footsteps", "assets/sound/footsteps.wav");
    }

    // Called when the game creates this object and places it on screen
    create(scene) {
        // Add a new physics sprite to the scene
        this.playerSprite = scene.physics.add.sprite(0, 0, "thanos");

        // Add the audio resources needed to the scene
        this.cashAudio = scene.sound.add("cash");
        this.unlockAudio = scene.sound.add("unlock");
        this.footstepAudio = scene.sound.add("footsteps");

        // Scale the player to the game scale
        this.playerSprite.setScale(CONSTANTS.PLAYER_SCALE);
        
        // Set the player's depth (z-index) to it's layer
        this.playerSprite.depth = CONSTANTS.LAYERS.PLAYER;

        // The collision body of the player is actually just his feet, making it more realistic when he stands in front of
        // other collidable objects
        this.playerSprite.body.setSize(25, 8);
        this.playerSprite.body.setOffset(5, 32);

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
        this.playerSprite.anims.play("front");
        this.playerSprite.anims.stop();
        this.playerSprite.setFrame(0);

        // Set the Light2D render pipeline to support light effects
        this.playerSprite.setPipeline("Light2D");

        // Now here comes a big workaround: because Phaser won't correctly light sprites which don't
        // have normal map information, we need one. Since our game is pixel-based and 2D, we don't
        // have any detailed normal information, so just use this flat dummy normal map containing
        // no height information at all. Took me three hours to figure out.
        helpers.enableSpriteSheetLighting(this.playerSprite);        
    
        // Apply the new key mappings      
        this.cursors = scene.input.keyboard.addKeys(CONSTANTS.KEYS);

        // Initially update cash and XP UI widgets
        window.game.ui.updateCashDisplay();
        window.game.ui.updateXPDisplay();
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
        this.playerSprite.setVelocity(mvec.x * CONSTANTS.MOVEMENT_SPEED, mvec.y * CONSTANTS.MOVEMENT_SPEED);

        // If the footsteps aren't playing already, and we're moving, start the footstep audio
        if (!this.footstepAudio.isPlaying && (mvec.x != 0 || mvec.y != 0)) {
            this.footstepAudio.setLoop(true);
            this.footstepAudio.setVolume(0.2);
            this.footstepAudio.play();
        } 
        // If footsteps are playing and we're not moving, stop the footsteps
        else if (this.footstepAudio.isPlaying && mvec.x == 0 && mvec.y == 0) {
            this.footstepAudio.stop();
        }

        // Animation State Machine
        if (this.cursors.left.isDown)
            this.playerSprite.anims.play('left', true);
        else if (this.cursors.right.isDown)
            this.playerSprite.anims.play('right', true);
        else if (this.cursors.down.isDown)
            this.playerSprite.anims.play('front', true);
        else if (this.cursors.up.isDown)
            this.playerSprite.anims.play('back', true);
        else {
            this.playerSprite.anims.stop();
            this.playerSprite.setFrame(0);
        }
    }

    // Sets the position of the player
    setPosition(x, y) {
        this.playerSprite.x = x;
        this.playerSprite.y = y;
    }

    // Returns the players position
    getPosition() {
        return {x: this.playerSprite.x, y: this.playerSprite.y };
    }

    // Returns the player's cash
    getCash() {
        return this.cash;
    }

    // Returns the player's XP
    getXP() {
        return this.xp;
    }

    // Returns the payer'S current level
    getLevel() {
        return this.currentLevel;
    }

    // Adds cash to the player's account
    addCash(cashToAdd) {
        // Add the money
        this.cash += cashToAdd;

        // Update the UI's cash display
        window.game.ui.updateCashDisplay();

        // Play the cash sound effect
        this.cashAudio.play();
    }

    // Adds XP to the player's experience
    addXP(xpToAdd) {
        // Check if we reached the XP_CAP
        if ((this.xp + xpToAdd) <= XP_CAP) {
            // Add the XP
            this.xp += xpToAdd;

            // Check if we just leveled up by going through all levels and checking their low boundary
            XP_LEVELS.forEach(function(lowBoundary, index) {
                if (this.xp > lowBoundary) {
                    this.currentLevel = index;
                }
            }.bind(this));
                    
            // Update the UI's XP display
            window.game.ui.updateXPDisplay();
        }
    }

    // Unlocks a specific item
    unlockItem(itemToUnlock) {
        this.unlockedItems.push(itemToUnlock);
        this.unlockAudio.play();
    }
}
