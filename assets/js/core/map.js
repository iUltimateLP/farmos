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
        // Load the tileset used for the map
        scene.load.image("tileset-farmos", "assets/img/tilesets/farmos-tileset.png");

        // For a huge performance increase, instead of displaying the whole map and all it's individual
        // tiles, we will use pre-baked mapsprites from Tiled as the map. This only forces the GPU to
        // render one texture for the map, instead of 50x64x13 individual tiles
        scene.load.image("farmos-mapsprite-summer", ["assets/maps/farmos-summer.png", "assets/img/misc/dummy_n.png"]);
        scene.load.image("farmos-mapsprite-autumn", ["assets/maps/farmos-autumn.png", "assets/img/misc/dummy_n.png"]);
        scene.load.image("farmos-mapsprite-winter", ["assets/maps/farmos-winter.png", "assets/img/misc/dummy_n.png"]);
        scene.load.image("farmos-mapsprite-spring", ["assets/maps/farmos-spring.png", "assets/img/misc/dummy_n.png"]);
        this.mapSprites = [];

        // Load the complete map importing from a Tiled .json
        scene.load.tilemapTiledJSON("farmos", "assets/maps/farmos.json");

        // Load sound ambience and the soundtrack
        scene.load.audio("theme-summer", "assets/sound/theme-summer.wav");
        scene.load.audio("theme-winter", "assets/sound/theme-snow.wav");
        scene.load.audio("ambience", "assets/sound/ambience.wav");

        // Tilemaps don't support static lighting. Same workaround as in the character, I am using a flat
        // dummy texture (white for the albedo, blurple for the normal map) to at least add *some* normal
        // information. This is loaded in a "dummy" texture, which isn't even present in the map, but it 
        // seems to work.
        scene.load.image('dummy', ['assets/img/misc/dummy.png', 'assets/img/misc/dummy_n.png']);

        // Start with the summer season, also store the music and nextMusic for transitioning between
        this.currentSeason = 1; // Summer
        this.music = undefined;
        this.nextMusic = undefined;
    }

    // Checks if a new piece of music should be started, synced to the season
    playMusic() {
        // Decide which music needs to go next based on the season
        this.nextMusic = window.game.scene.sound.add(this.currentSeason == 3 ? "theme-winter" : "theme-summer");
        
        // If music is currently playing...
        if (this.music && this.music.source) {
            // ...get notified when it ends and stop the music and reset it
            this.music.source.onended = function() {
                this.music.stop();
                this.music = undefined;
            }.bind(this);
        } else {
            // Set the current music to be the scheduled next music and play it
            this.music = this.nextMusic;
            this.music.play();
        }
    }

    // Smoothly transitions into the next season
    nextSeason() {
        // Safety check because sometimes this will get called before the game actually fully initialized
        if (window.game.scene && window.game.scene.time) {
            // Calculate which the next season will be
            var seasons = ["spring", "summer", "autumn", "winter"];
            var nextSeason = (this.currentSeason + 1) % 4;

            // Alpha holds the current opacity of the season layers (0..1)
            var alpha = 0;

            // How big one "step" is while fading. The inverse of this is the amount of steps (1 / step)
            var step = 1 / 120; // 120 Hz

            // We can make use of Phaser's SceneTime to add a event to be periodically called
            window.game.scene.time.addEvent({
                delay: step, // Wait the step interval between the events
                callback: function() {
                    // Increase the alpha
                    alpha = alpha + step;

                    // If the next season baked map sprite is hidden, show it
                    if (!this.mapSprites[nextSeason].visibility) {
                        this.mapSprites[nextSeason].setVisible(true);
                    }

                    // Gradually fade out the current season's map, and fade in the next season
                    this.mapSprites[this.currentSeason].alpha = 1 - alpha;
                    this.mapSprites[nextSeason].alpha = alpha;

                    // If the next season is winter, also fade in the snow overlay
                    if (nextSeason == 3) {
                        document.getElementById("snow-overlay").style.opacity = alpha;
                    } else if (nextSeason == 0) {
                        document.getElementById("snow-overlay").style.opacity = (1 - alpha);
                    }

                    // If we finished fading the seasons
                    if (alpha >= 1) {
                        // Hide the previous season layer
                        this.mapSprites[this.currentSeason].setVisible(false);

                        // Set the new season as the current season
                        this.currentSeason = nextSeason;
                        
                        // Initiate a music change
                        this.playMusic();
                    }
                },
                callbackScope: this,
                repeat: 1 / step // The inverse of the step amount is the amount of steps
            });
        }
    }

    // Called when the game creates this object and places it on screen
    create(scene) {
        // Add the dummy texture to the scene using a tiled sprite and enable lighting
        this.lightingDummy = scene.add.tileSprite(0, 0, 64*32*CONSTANTS.GAME_SCALE, 64*32*CONSTANTS.GAME_SCALE, "dummy");
        this.lightingDummy.setPipeline("Light2D");

        // Start the ambience sound effect, lower it's volume and loop it
        this.ambienceSound = scene.sound.add("ambience");
        this.ambienceSound.setVolume(0.5);
        this.ambienceSound.setLoop(true);

        if (CONSTANTS.AMBIENCE_ENABLED) {
            this.ambienceSound.play();
        }

        // Go through all the seasons...
        var seasons = ["spring", "summer", "autumn", "winter"];
        seasons.forEach(function(s, i) {
            // ...and create a sprite for each of them
            var sprite = scene.add.image(0, 0, "farmos-mapsprite-" + s);
            sprite.setPipeline("Light2D");

            // The map sprites are 1024x768 pixels
            sprite.displayWidth =  1024 * CONSTANTS.GAME_SCALE;
            sprite.displayHeight = 768 * CONSTANTS.GAME_SCALE;
            sprite.depth = CONSTANTS.LAYERS.TERRAIN;

            // Make sure they don't get centered
            sprite.setOrigin(0,0);

            // Set their initial alpha to zero except the summer one
            if (i != 1) {
                sprite.alpha = 0;
            }

            // Push them to our array so we have a reference to them later
            this.mapSprites.push(sprite);
        }.bind(this));

        // Create a tilemap using the map imported from Tiled
        // Even though we use prebaked map sprites, we use the tilemap for collision
        this.tileMap = scene.make.tilemap({
            key: "farmos",
            tileWidth: 16,
            tileHeight: 16
        });

        // Add the tileset to the map
        // Note: Param 1 has to be the tileset name specified in Tiled
        // Param 2 is the key of the image in the game
        this.tileSet = this.tileMap.addTilesetImage("Farmos", "tileset-farmos", 16, 16, 1, 2);

        // We use an array to store all created layers in order
        this.mapLayers = [];

        // We only use the collision layer of the tile map, so find the collision layer
        var collisionLayerData = this.tileMap.layers.find(function(v, i) {
            if (v.name) {
                return v.name == "Collision";
            }
            
            return false;
        })

        // Create the collision static layer and make sure to hide it so we won't see it in game
        var collisionStaticLayer = this.tileMap.createStaticLayer(collisionLayerData.name, this.tileSet, 0, 0);
        collisionStaticLayer.setScale(CONSTANTS.GAME_SCALE);
        collisionStaticLayer.setCollisionByProperty({collision: true});
        collisionStaticLayer.setVisible(false);

        // Make sure the player collides with these
        scene.physics.add.collider(window.game.player.playerSprite, collisionStaticLayer);

        // Now we'll create a static layer for each layer in the imported map
        // Not used because of pre-baked sprites
        /*this.tileMap.layers.forEach(function(layerData) {
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
            scene.physics.add.collider(window.game.player.playerSprite, newStaticLayer);

            // Store the new layer in our array
            this.mapLayers.push(newStaticLayer);

            // Hide all season layers at first
            if (layerData.name.includes("WINTER") || layerData.name.includes("AUTUMN") || layerData.name.includes("SPRING")) {
                newStaticLayer.setVisible(false);
            }
        }, this); // This forEach has `this` as the context so we can access our Map object from inside the loop
        */

        // Set the main cameras' bounds and start following the player
        scene.cameras.main.setBounds(0, 0, this.tileMap.widthInPixels * CONSTANTS.GAME_SCALE, this.tileMap.heightInPixels * CONSTANTS.GAME_SCALE);
        scene.cameras.main.startFollow(window.game.player.playerSprite, true, 0.09, 0.09);
 
        // Phaser needs at least one light in the scene for light to work
        // Also this light is needed otherwise the player won't be visibe when moving out of the lights
        // scene bounds. Thats why we update this light's position to follow the player. The light itself
        // is invisible.
        this.dummyLight = scene.lights.addLight(0, 0, 5000, 0xffffff, 0);

        // Enable the whole light system
        scene.lights.enable();
        scene.lights.setAmbientColor(0xffffff); // 0x2a5393

        // Set the players position to be at the spawnpoint
        var spawnpoint = helpers.findObjectInMap("Spawnpoint");
        window.game.player.setPosition(spawnpoint.x * CONSTANTS.GAME_SCALE, spawnpoint.y * CONSTANTS.GAME_SCALE);

        // Populate all objects on the map
        // Go through each object layer
        this.tileMap.objects.forEach(function(objectLayer) {
            // Go through each object on the layer
            objectLayer.objects.forEach(function(object) {
                // Determine the object's position
                var x = (object.x + (object.width / 2)) * CONSTANTS.GAME_SCALE;
                var y = (object.y + (object.height / 2)) * CONSTANTS.GAME_SCALE;

                // Create the JS objects based on the object's type field
                switch (object.type) {
                    case "chest":
                        new Chest(x, y);
                        break;
                
                    case "torch":
                        new Torch(x, y);
                        break;

                    case "farmField":
                        new FarmField(x, y);
                        break;

                    case "fruitTree":
                        var item = ITEM_NONE;
                        switch (object.properties[0].value) {
                            case "apple":
                                item = ITEM_APPLE;
                                break;
                            case "walnut":
                                item = ITEM_WALNUTS;
                                break;
                            case "lemon":
                                item = ITEM_LEMON;
                                break;
                            case "ananas":
                                item = ITEM_PINEAPPLE;
                                break;
                            case "cherry":
                                item = ITEM_CHERRY;
                                break;
                            case "peach":
                                item = ITEM_PEACH;
                                break;
                            case "pear":
                                item = ITEM_PEAR;
                                break;
                            case "kiwi":
                                item = ITEM_KIWI;
                                break;
                            case "orange":
                                item = ITEM_ORANGE;
                                break;
                            case "durian":
                                item = ITEM_DURIAN;
                                break;
                        }

                        new FruitTree(x, y, item);
                        break;

                    case "market":
                        new Market(x, y);
                        break;

                    default:
                        break;
                }
            });
        });

        // After adding all items, populate the skill tree
        setTimeout(function() {
            populateSkillTree();
        }, 500);

        // Finally start playing music
        if (CONSTANTS.MUSIC_ENABLED) {
            this.playMusic();
        }
    }

    // Called when the game wants to update this object (every tick)
    update(scene, time, delta) {
        // We need to move our dummy light with the player (workaround)
        this.dummyLight.x = window.game.player.playerSprite.x;
        this.dummyLight.y = window.game.player.playerSprite.y;
    }

    // Returns all layers of the map
    getLayers() {
        return this.mapLayers;
    }
}
