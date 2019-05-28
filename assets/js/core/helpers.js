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
            // Use Array.find to find an object in the current layer's object which matches the name
            foundObject = layer.objects.find(function(obj) {
                return obj.name === objectName;
            });
        });

        return foundObject;
    }
};
