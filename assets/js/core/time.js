/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: time.js
    Purpose: Time Manager, handling the game time, simulation speed, etc.
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

class TimeManager {
    // Default constructor
    constructor() {
        // Bind game events
        window.game.events.on("preload", this.preload, this);
        window.game.events.on("create", this.create, this);
        window.game.events.on("update", this.update, this);

        // For convenience, we store the current in-game Date and Time in a native Date object
        // While this is used for the "real" time of date, it provides all the fields we need
        // for in-game time aswell, so why not? Also lets start at the 28.06.2023 8:00
        this.time = new Date(2023, 6, 28, 8, 0, 0);

        // Initial speed factor
        this.speed = CONSTANTS.SIMULATION_SPEED.NORMAL;
    }

    preload(scene) {
        
    }

    create(scene) {
        // A debug label displaying the current time
        this.debugLabel = scene.add.text(20, 20, "", {
            backgroundColor: '#000000'
        });
    }

    update(scene, time, delta) {
        // Tick the time (setting the milliseconds will automatically convert up into seconds/minutes/hours)
        this.time.setMilliseconds(this.time.getMilliseconds() + (delta * this.speed * CONSTANTS.SIMULATION_SPEED_FACTOR));

        // Update the debug label's text and position (otherwise it will stick at world position)
        this.debugLabel.x = scene.cameras.main.worldView.x + 10;
        this.debugLabel.y = scene.cameras.main.worldView.y + 10;
        this.debugLabel.setText(this.time.toNiceString());
    }

    // Sets the new simulation speed
    setSimulationSpeed(speed) {
        this.speed = speed;
    }
}
