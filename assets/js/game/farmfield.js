/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: farmfield.js
    Purpose: FarmField Game Object
*/

// Theres a global farmfield counter for referencing the templates
var farmFieldCounter = 0;

class FarmField {
    // Default constructor
    constructor(x, y) {
        farmFieldCounter++;

        // Initialize all parameters
        this.x = x;
        this.y = y;
        this.stage = 0;
        this.plantedAt = undefined;
        this.stages = [];

        // Create the template for the interactable component, this is used for clicking on the farm fields only
        // (not the crops!)
        const fieldTemplate = {
            name: "farmField_" + farmFieldCounter,
            id: "farmField",
            sprite: "assets/img/objects/farmField.png",
            frameHeight: 16,
            frameWidth: 16,
            displayHeight: 64,
            displayWidth: 64,
            onInteract: this.onInteract.bind(this)
        };

        // Register the interactable component with the given template, this also adds it to screen
        this.interactable = new Interactable(x, y, fieldTemplate);

        // We store all farm fields in a global stack
        window.game.farm.farmFields.push(this);
    }

    preload(scene) {
        // Register a complete handler for the game loader
        scene.load.once("complete", function() {
            this.create(scene);
        }, this);

        // Queue up loading the spritesheet for the farm items (all four stages are in the spritesheets)
        scene.load.spritesheet(this.seedItem.name, this.seedItem.farmSheet, {
            frameWidth: 16,
            frameHeight: 16
        });
       
        // Start loading
        scene.load.start();     
    }

    create(scene) {
        // Create a new sprite for the crop
        this.seed = scene.add.sprite(this.x, this.y-10, this.seedItem.name);
        this.seed.displayWidth = 64;
        this.seed.displayHeight = 64;
        this.seed.depth = CONSTANTS.LAYERS.OBJECTS;

        // Initially set it to stage 0
        this.setStage(0);

        // Enable lighting pipeline
        this.seed.setPipeline("Light2D");

        // Make the seed lightable
        helpers.enableSpriteSheetLighting(this.seed);  
        
        // Update the post process camera filter
        window.game.postprocess.updateCameraFilter();   
    }

    // Sets the seed for this farm field
    setSeed(item) {
        // If there's a seed already, destroy it first
        if (this.seed) {
            this.seed.destroy();
        }

        // Set the new seed
        this.seedItem = item;

        // Start preloading the assets
        this.preload(window.game.scene);
    }

    // Sets the stage of this crop
    setStage(newStage) {
        // If there's a seed and an seed item
        if (this.seed && this.seedItem) {
            // Set the frame of the sprite
            this.seed.setFrame(newStage);
            this.stage = newStage;

            this.seed.displayWidth = 64;
            this.seed.displayHeight = 64;
            this.seed.depth = CONSTANTS.LAYERS.OBJECTS;
        }
    }

    // Called when the user interacts with this farm field
    onInteract(interactable) {
        // If a seed item is set...
        if (this.seedItem) {
            // ...check if it is ripe
            if (this.stage < 3) {
                //console.log(this.seedItem.friendlyName + " is not ripe yet!");
            } else {
                //console.log(this.seedItem.friendlyName + " is ripe");

                // If it's ripe, add the seed item to inventory
                if (window.game.player.inventory.addItem(this.seedItem, 1)) {
                    // Destroy the seed and award the player with XP
                    this.seed.destroy();
                    window.game.player.addXP(this.seedItem.xpGain);

                    this.seedItem = undefined;
                }
            }
        } 
        // We want to plant a seed
        else if (window.game.itemInHand && window.game.itemInHand.item.type === "seed") {
            // Get the plant associated to the seed
            var seedPlant = window.game.itemInHand.item.plant;

            // Set the seed
            this.setSeed(seedPlant);

            // Update the item in hand count
            var newItemAmount = window.game.player.inventory.getItemAmount(window.game.itemInHandIdx) - 1;
            window.game.player.inventory.setItemAmount(window.game.itemInHandIdx, newItemAmount);
            updateItemInHandCount(newItemAmount);

            // Store the time at which this was planted
            this.plantedAt = window.game.time.now();

            // growTime is in hours
            var growTime = seedPlant.growTime;

            // Calculate the times for all grow stages
            var stage1Time = new Date(this.plantedAt.getTime());
            var stage2Time = new Date(this.plantedAt.getTime());
            var stage3Time = new Date(this.plantedAt.getTime());

            // Grow stages are just at third fractions
            stage1Time.setHours(stage1Time.getHours() + (0.3 * growTime + (Math.random() * 4)));
            stage2Time.setHours(stage2Time.getHours() + (0.6 * growTime + (Math.random() * 4)));
            stage3Time.setHours(stage3Time.getHours() + (1 * growTime + (Math.random() * 4)));

            this.stages = [stage1Time, stage2Time, stage3Time];
        }
    }
}
