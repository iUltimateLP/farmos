/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: constants.js
    Purpose: Holds constants used by the game for an easy place to access
*/

const CONSTANTS = {
    // Depth layer indices for elements in the game
    LAYERS: {
        TERRAIN: 1, // This is the base terrain layer, each layer of sprites gets added over this layer, so calculate that in
        PLAYER: 10
    },

    // Overall game scale
    GAME_SCALE: 2,

    // Velocity at which the player moves on
    MOVEMENT_SPEED: 300,

    // Key Mappings
    KEYS: {
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    },

    // Simulation base speed
    SIMULATION_SPEED_FACTOR: 100,

    // Simulation speed factors
    SIMULATION_SPEED: {
        NORMAL: 1,
        FAST: 2,
        FASTER: 2.5,
        VERYFAST: 3
    }
};
