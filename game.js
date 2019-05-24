/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: game.js
    Purpose: Main script loading at game load. Entry point for everything else
*/

// Create a new Phaser game instance (it is also automatically stored in window.phaser)
var phaser = new Phaser.Game({
    type: Phaser.AUTO, // Automatically decides whether to use WebGL or Canvas API
    //width: window.innerWidth,
    //height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.ScaleModes.RESIZE // Automatically resize the game to fit the available space disregarding aspect ratio
    },
    physics: {
        // We are using arcade physics, but without gravity because this is a top-down game
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {x: 0, y: 0}
        }
    },
    scene: {
        // Scene hooks
        preload: preload,
        create: create,
        update: update
    },
    antialias: false // Pixel perfect rendering
});

// Create a new global game object. We use this to store various global objects in it
window.game = {};

// Create a new Phaser event emitter for registering to events like preload, create and update
window.game.events = new Phaser.Events.EventEmitter();;

// Instantiate a new playable character
window.game.playableCharacter = new PlayableCharacter();

// Instantiate a new map
window.game.map = new Map();

// Called when the game preloads assets for later use
function preload() {
    // Emit the preload event using "this" as a scene parameter
    window.game.events.emit("preload", this);
}

// Called when the game creates this object and places it on screen
function create() {
    // Emit the create event using "this" as the scene
    window.game.events.emit("create", this);
}

// Called when the game wants to update this object (every tick)
function update(time, delta) {
    // Emit the update event using "this" as the scene, time and delta will be passed too
    window.game.events.emit("update", this, time, delta);
}
