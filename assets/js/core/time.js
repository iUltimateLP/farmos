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

// Holds all the color vlaues / gradient stops for the day/night cycle ambient light based on the time of day
const AMBIENT_COLOR_GRADIENT = {
    0: 0x5926b7,
    2: 0x5926b7,
    5: 0xff6bf6,
    7: 0xffbe53,
    10: 0xfaf4e6,
    17: 0xfaf4e6,
    19: 0xffc68d,
    21: 0xf658a5,
    23: 0x5926b7
}

class TimeManager {
    // Default constructor
    constructor() {
        // Bind game events
        window.game.events.on("update", this.update, this);

        // For convenience, we store the current in-game Date and Time in a native Date object
        // While this is used for the "real" time of date, it provides all the fields we need
        // for in-game time aswell, so why not? Also lets start at the 28.07.2023 8:00
        this.time = new Date(2023, 6, 28, 8, 0, 0);

        // Initial speed factor
        this.speed = CONSTANTS.SIMULATION_SPEED.NORMAL;

        // Event handler for registering to time specific events
        this.events = new Phaser.Events.EventEmitter();

        // These flags are used for checking if an event on the emitter was already called
        this.calledMorning = false;
        this.calledNoon = false;
        this.calledEvening = false;
        this.calledNight = false;
        this.checkedCrops = false;
        this.didSeasonChange = false;

        // We use this to periodically check for tasks such as growing crops
        this.checkPeriodicalTasks();
    }

    // Called every Phaser tick
    update(scene, time, delta) {
        // Tick the time (setting the milliseconds will automatically convert up into seconds/minutes/hours)
        this.time.setMilliseconds(this.time.getMilliseconds() + (delta * this.speed * CONSTANTS.SIMULATION_SPEED_FACTOR));

        // Update the sky's ambient color
        this.updateAmbientLightColor();

        // Check if we can emit an event to the event emitter to notify about the time of day
        // Only emits once, thats why we have the flags
        if (this.time.getHours() == 8 && !this.calledMorning) {
            this.events.emit("morning");

            this.calledMorning = true;
            this.calledNoon = false;
            this.calledEvening = false;
            this.calledNight = false;
        } else if (this.time.getHours() == 12 && !this.calledNoon) {
            this.events.emit("noon");

            this.calledMorning = false;
            this.calledNoon = true;
            this.calledEvening = false;
            this.calledNight = false;            
        } else if (this.time.getHours() == 18 && !this.calledEvening) {
            this.events.emit("evening");

            this.calledMorning = false;
            this.calledNoon = false;
            this.calledEvening = true;
            this.calledNight = false;            
        } else if (this.time.getHours() == 21 && !this.calledNight) {
            this.events.emit("night");

            this.calledMorning = false;
            this.calledNoon = false;
            this.calledEvening = false;
            this.calledNight = true;            
        }
    }

    // Periodically check for tasks such as growing crops
    checkPeriodicalTasks() {
        // Now is now
        var now = new Date(this.time.getTime());

        // If the farm fields are valid
        if (window.game.farm && window.game.farm.farmFields) {
            // Go through each farm field
            window.game.farm.farmFields.forEach(function(farmField, i) {
                // If there's a seed planted on them
                if (farmField.seed && farmField.seedItem) {
                    // Check on which stage they are by comparing the time and their different stages
                    var currentStage = 0;
                    farmField.stages.forEach(function(stage, index) {
                        if (stage.getTime() <= now.getTime()) {
                            currentStage = index + 1;
                        }
                    })

                    // If the stage is above zero, update the farm field to actually receive the new stage
                    if (currentStage > 0) {
                        farmField.setStage(currentStage);
                    }
                }
            });
        }

        // If the fruit trees are valid
        if (window.game.farm && window.game.farm.fruitTrees) {
            // Go through each fruit tree
            window.game.farm.fruitTrees.forEach(function(fruitTree, i) {
                // If the fruit tree has a next ripe time set and it should be ripe by now and it isn't locked, set it to be ripe
                if (fruitTree.nextRipe && fruitTree.nextRipe.getTime() <= now.getTime() && !fruitTree.isRipe && !fruitTree.isLocked) {
                    fruitTree.setRipe(true);
                }
            })
        }

        // Check if we should update a season
        // Season dates are
        // 01.03 - spring
        // 01.06 - summer
        // 01.09 - autumn
        // 01.12 - winter
        var month = this.time.getMonth();

        // If the current month (months start from 0 in js) is dividable through 3 and seasons didn't change already
        if ((month+1) % 3 == 0 && !this.didSeasonChange) {
            // Trigger a season change
            window.game.map.nextSeason();

            // Set this flag so the if statement above won't be fired again
            this.didSeasonChange = true;
        } 
        // Check if the month IS NOT dividable through 3 and the flag is set
        else if ((month+1) % 3 != 0 && this.didSeasonChange) {
            // in that case, we can safely reset it to let the first if statement fire next roud
            this.didSeasonChange = false;
        }

        // Check for crop growth every 3 seconds (real time!)
        setTimeout(this.checkPeriodicalTasks.bind(this), 3*1000);
    }

    // Sets the new simulation speed
    setSimulationSpeed(speed) {
        this.speed = speed;
    }

    // Returns the current time
    now() {
        // Copy-Constructor, otherwise it'd return a live reference to the original time
        return new Date(this.time.getTime());
    }

    // Sets the simulation to be morning
    morning() {
        this.time.setHours(4);
    }

    // Sets the simulation to be noon
    noon() {
        this.time.setHours(12);
    }

    // Sets the simulation to be evening
    evening() {
        this.time.setHours(17);
    }

    // Sets the simulation to be night
    night() {
        this.time.setHours(21);
    }

    // Returns the current ambient light color by looking at the time of day and the color gradient
    updateAmbientLightColor() {
        // Calculate the position on the gradient by looking at the time (0..1, 0.5 = 12:00)
        var h = (this.time.getHours() / 24) * 24;
        var m = this.time.getMinutes();

        // Calculate the time step taking minutes into accout aswell
        var hour = (0.5 * (h * 60 + m)) / 360;

        // Calculate a position on the gradient (the gradient goes from 0..24)
        var gradientPos = hour * 12;

        // Holds two gradient stops, a left one and a right one, encapsulating the gradient slice we're looking at
        var leftStop = -1;
        var rightStop = -1;

        // Find the stops by looking at the gradient's keys
        var gradientStops = Object.keys(AMBIENT_COLOR_GRADIENT);

        gradientStops.forEach(function(stopValue, stopIndex) {
            // Get the stop
            var stop = parseInt(stopValue);

            // Check if a next stop after this exists
            if ((stopIndex + 1) < gradientStops.length) {
                // Parse the next stop
                var nextStop = parseInt(gradientStops[stopIndex+1]);
                
                // Check if the gradient position is inside these boundaries
                if (gradientPos >= stop && gradientPos < nextStop) {
                    leftStop = stop;
                    rightStop = nextStop;
                }
            } 
            // If no next stop exists, we arrived at the end of the gradient
            else {
                // We can loop back to the first gradient stop
                if (gradientPos >= stop) {
                    leftStop = stop;
                    rightStop = gradientStops[0];
                }
            }
        });

        // Get the colors from the two gradient stops
        var color1 = Phaser.Display.Color.ColorToRGBA(AMBIENT_COLOR_GRADIENT[leftStop]);
        var color2 = Phaser.Display.Color.ColorToRGBA(AMBIENT_COLOR_GRADIENT[rightStop]);

        // Calculate the interpolation factor which goes from 0..100 because we've taken 100 interpolation steps
        var interp = ((gradientPos - leftStop) / (rightStop - leftStop)) * 100;

        // Now interpolate and get the new color
        var newAmbientColor = Phaser.Display.Color.Interpolate.RGBWithRGB(color1.r, color1.g, color1.b, color2.r, color2.g, color2.b, 100, interp);

        // Apply the color to the scene's ambient light
        window.game.scene.lights.setAmbientColor(Phaser.Display.Color.GetColor(newAmbientColor.r, newAmbientColor.g, newAmbientColor.b));
    }
}
