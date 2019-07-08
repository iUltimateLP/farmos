/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: helpers.js
    Purpose: Contains helper functions used at some places in the code
*/

var helpers = {
    // Finds a object by name in the game map
    findObjectInMap: function(objectName) {
        var foundObject;

        // Iterate through each object layer
        window.game.map.tileMap.objects.forEach(function(layer) {
            if (!foundObject) {
                // Use Array.find to find an object in the current layer's object which matches the name
                foundObject = layer.objects.find(function(obj) {
                    return obj.name === objectName;
                });
            }
        });

        return foundObject;
    },

    // Returns all native sprites from all objects registered
    getObjectSprites: function() {
        var sprites = [];
        
        window.game.objects.forEach(function(obj) {
            if (obj.sprite) {
                sprites.push(obj.sprite);
            }
        })

        return sprites;
    },

    // Returns all native sprites of all farm fields
    getFarmFieldSprites: function() {
        var sprites = [];
        
        window.game.farm.farmFields.forEach(function(obj) {
            if (obj.seed) {
                sprites.push(obj.seed);
            }
        })

        return sprites;
    },

    // Now here comes a big workaround: because Phaser won't correctly light sprites which don't
    // have normal map information, we need one. Since our game is pixel-based and 2D, we don't
    // have any detailed normal information, so just use this flat dummy normal map containing
    // no height information at all. Took me three hours to figure out.
    // Makes a spritesheet lightable by adding a dummy normal map to the texture's data source
    enableSpriteSheetLighting: function(sprite) {
        // Create a new WebGL Image object and load the dummy normal map
        var dummyNormal = new Image();
        dummyNormal.src = "assets/img/misc/dummy_n.png";

        // Since loading assets is asynchronous, wait for the loading to finish
        dummyNormal.addEventListener("load", function(event) {
            // Set the texture's data source to point at the normal WebGL texture (stored in event.path[0])
            sprite.texture.setDataSource([event.path[0]]);
        }.bind(this));
    }
};
