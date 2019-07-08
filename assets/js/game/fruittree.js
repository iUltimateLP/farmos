/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: fruittree.js
    Purpose: FruitTree Game Object
*/

// Theres a global fruittree counter for referencing the templates
var fruitTreeCounter = 0;

class FruitTree {
    // Default constructor
    constructor(x, y, fruit) {
        fruitTreeCounter++;

        // Initialize all parameters
        this.x = x;
        this.y = y;
        this.fruit = fruit;
        this.nextRipe = undefined;
        this.isRipe = false;
        this.isLocked = false;
        this.sprites = [];

        // Create the template for the interactable component
        const treeTemplate = {
            name: "fruitTree_" + farmFieldCounter,
            id: "fruitTree",
            sprite: "assets/img/objects/fruitTree.png",
            frameHeight: 32,
            frameWidth: 32,
            displayHeight: 128,
            displayWidth: 128,
            onInteract: this.onInteract.bind(this)
        };

        // Register the interactable component with the given template, this also adds it to screen
        this.interactable = new Interactable(x, y, treeTemplate);

        // We store all farm fields in a global stack
        window.game.farm.fruitTrees.push(this);

        // Start preloading the assets
        this.preload(window.game.scene);
    }

    preload(scene) {
        // Register a complete handler for the game loader
        scene.load.once("complete", function() {
            this.create(scene);
        }, this);

        // Load the image of the fruit associated to this tree
        scene.load.image(this.fruit.name, [this.fruit.sprite, "assets/img/misc/dummy_n.png"]);
       
        // Start loading
        scene.load.start();     
    }

    create(scene) {
        // This contains the positions for the three small fruits displayed on the tree
        var positions = [{
            x: this.x - 12, 
            y: this.y - 32
        }, {
            x: this.x + 32,
            y: this.y - 16
        }, {
            x: this.x - 32,
            y: this.y + 16
        }];

        // If there are sprites stored, destroy them
        this.sprites.forEach(function(sprite) {
            sprite.destroy();
        })
        this.sprites = [];

        // Create three sprites for all fruits hanging on this tree
        for (var i = 0; i < 3; i++) {
            var fruit = scene.add.sprite(positions[i].x, positions[i].y, this.fruit.name);

            // Calculate a slight random size variation for the fruits
            var size = 48 + (0.5 - (Math.random() * 8));

            // Apply the size
            fruit.displayWidth = size;
            fruit.displayHeight = size;
            fruit.depth = CONSTANTS.LAYERS.OBJECTS + 10;

            // Enable lighting
            fruit.setPipeline("Light2D");

            // Push the sprite to the sprites
            this.sprites.push(fruit);
        }

        // Update the camera filter
        window.game.postprocess.updateCameraFilter();

        // Initially set trees locked and not ripe
        this.setRipe(false);
        this.setLocked(true);
    }

    // Sets a tree locked or unlocked
    setLocked(isLocked) {
        this.isLocked = isLocked;

        // Just set the frame of the texture
        if (isLocked) {
            this.interactable.setFrame(0);
        } else {
            this.interactable.setFrame(1);
        }

        this.setRipe(false);
    }

    // Sets a tree ripe
    setRipe(isRipe) {
        this.isRipe = isRipe;

        // Go through all fruit sprites and set them visible
        this.sprites.forEach(function(sprite) {
            sprite.setVisible(isRipe);
        })

        // If set to not ripe, calculate when this tree will be ripe
        if (!isRipe) {
            this.nextRipe = new Date(window.game.time.now().getTime());
            this.nextRipe.setHours(this.nextRipe.getHours() + this.fruit.growTime);            
        }
    }

    // Called when the user interacts with this tree
    onInteract(interactable) {
        // Check if the tree is ripe
        if (!this.isRipe) {
            //console.log("[" + this.fruit.name + "] Not ripe yet");
        } else {
            // Add the fruit to the player's inventory
            if (window.game.player.inventory.addItem(this.fruit, 3)) {
                // Set the tree to not ripe again
                this.setRipe(false);

                // Award the player with XP
                window.game.player.addXP(this.fruit.xpGain);
            }
        }
    }
}
