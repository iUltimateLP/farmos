/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: ui.js
    Purpose: User Interface Manager
*/

// A handy prototype function to get a nice time/date string
Date.prototype.toNiceString = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
    var hh = this.getHours();
    var MM = this.getMinutes();
    var ss = this.getSeconds();

    return [(dd>9 ? "" : "0") + dd + ".",
            (mm>9 ? "" : "0") + mm + ".",
            this.getFullYear() + " ",
            (hh>9 ? "" : "0") + hh + ":",
            (MM>9 ? "" : "0") + MM + ":",
            (ss>9 ? "" : "0") + ss
        ].join("");
};

class UIManager {
    // Default constructor
    constructor() {
        // Bind game events
        window.game.events.on("preload", this.preload, this);
        window.game.events.on("create", this.create, this);
        window.game.events.on("update", this.update, this);
    }

    // Called when the game preloads assets for later use
    preload(scene) {

    }

    // Called when the game creates this object and places it on screen
    create(scene) {
        // A debug label displaying the current time
        this.debugLabel = scene.add.text(20, 20, "", {
            backgroundColor: '#000000'
        });
    }

    // Called when the game wants to update this object (every tick)
    update(scene, time, delta) {

        // Update the debug label's text and position (otherwise it will stick at world position)
        this.debugLabel.x = scene.cameras.main.worldView.x + 10;
        this.debugLabel.y = scene.cameras.main.worldView.y + 10;
        this.debugLabel.setText(window.game.time.now().toNiceString());
    }

    // Returns all UI elements rendered by this UI manager
    getAllUIElements() {
        return [this.debugLabel];
    }
}
