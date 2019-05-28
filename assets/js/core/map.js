/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: map.js
    Purpose: This script cares about importing the map, loading the tileset and creating a layered terrain
*/

class Map {
    // Default constructor
    constructor() {
        // Bind game events
        window.game.events.on("preload", this.preload, this);
        window.game.events.on("create", this.create, this);
        window.game.events.on("update", this.update, this);        
    }

    // Called when the game preloads assets for later use
    preload(scene) {
        console.log("[Map] Initializing");

        // Load the tileset used for the map
        scene.load.image("tileset-tuxmon", "assets/img/tilesets/tuxmon-32px.png");

        // Load the complete map importing from a Tiled .json
        scene.load.tilemapTiledJSON("testmap", "assets/maps/testmap.json");

        // Tilemaps don't support static lighting. Same workaround as in the character, I am using a flat
        // dummy texture (white for the albedo, blurple for the normal map) to at least add *some* normal
        // information. This is loaded in a "dummy" texture, which isn't even present in the map, but it 
        // seems to work.
        scene.load.image('dummy', ['assets/img/misc/dummy.png', 'assets/img/misc/dummy_n.png']);
    }

    // Called when the game creates this object and places it on screen
    create(scene) {
        console.log("[Map] Creating");

        // Add the dummy texture to the scene using a tiled sprite and enable lighting
        scene.add.tileSprite(256, 256, 800, 600, "dummy").setPipeline("Light2D");

        // Create a tilemap using the map imported from Tiled
        this.tileMap = scene.make.tilemap({
            key: "testmap",
            tileWidth: 64,
            tileHeight: 64,
            width: 64,
            heigth: 64
        });

        // Add the tileset to the map
        // Note: Param 1 has to be the tileset name specified in Tiled
        // Param 2 is the key of the image in the game
        this.tileSet = this.tileMap.addTilesetImage("tuxmon-32px", "tileset-tuxmon");

        // We use an array to store all created layers in order
        this.mapLayers = [];

        // Now we'll create a static layer for each layer in the imported map
        this.tileMap.layers.forEach(function(layerData) {
            console.log("[Map] Constructing layer '" + layerData.name + "'");

            // Create a new static layer assigned to the current layer data's name, using the tileset created earlier
            const newStaticLayer = this.tileMap.createStaticLayer(layerData.name, this.tileSet, 0, 0);

            newStaticLayer.setPipeline("Light2D");

            // Scale the map according to the game scale
            newStaticLayer.setScale(CONSTANTS.GAME_SCALE);

            // A nice trick: in Tiled we set specific tiles in the tileset to be collision-enabled.
            // This sets all tiles in the layer collidable which have the `collision` flag set
            newStaticLayer.setCollisionByProperty({
                collision: true
            });

            // Add the layer as a collider to the player so they'll collide
            scene.physics.add.collider(window.game.playableCharacter.player, newStaticLayer);

            // Store the new layer in our array
            this.mapLayers.push(newStaticLayer);
        }, this); // This forEach has `this` as the context so we can access our Map object from inside the loop

        // Set the main cameras' bounds and start following the player
        scene.cameras.main.setBounds(0, 0, this.tileMap.widthInPixels * CONSTANTS.GAME_SCALE, this.tileMap.heightInPixels * CONSTANTS.GAME_SCALE);
        scene.cameras.main.startFollow(window.game.playableCharacter.player, true, 0.09, 0.09);
        
        // Set up the lighting: Phaser needs at least one light in the scene, so create one
        this.light = scene.lights.addLight(0, 0, 200, 0xfff7a3, 1);

        // Enable the whole light system
        scene.lights.enable();
        scene.lights.setAmbientColor(0xffffff); // 0x2a5393

        // Set the players position to be at the spawnpoint
        var spawnpoint = helpers.findObjectInMap("spawnpoint");
        window.game.playableCharacter.player.x = spawnpoint.x;
        window.game.playableCharacter.player.y = spawnpoint.y;

        // Add some test lights
        //scene.lights.addLight(100, 100, 100).setColor(0xff0000).setIntensity(20.0);
        //scene.lights.addLight(200, 200, 100).setColor(0x00ff00).setIntensity(10.0);
        //scene.lights.addLight(300, 300, 100).setColor(0x0000ff).setIntensity(10.0);
        //scene.lights.addLight(400, 400, 100).setColor(0xffffff).setIntensity(10.0);
    }

    // Called when the game wants to update this object (every tick)
    update(scene, time, delta) {
        //console.log(scene.lights.culledLights);
        this.light.x = window.game.playableCharacter.player.x;
        this.light.y = window.game.playableCharacter.player.y;
    }
}
