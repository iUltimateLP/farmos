/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: postprocess.js
    Purpose: Adds GLSL shaders to add post process effects to the game
*/

// A handy GLSL shader function to convert hue data to rgb data
const HUEToRGB = `
float HUEToRGB(float f1, float f2, float hue) {
	if (hue < 0.0) {
		hue += 1.0;
	} else if (hue > 1.0) {
		hue -= 1.0;
	}
		
	float ret;
	
	if ((6.0 * hue) < 1.0) {
		ret = f1 + (f2 - f1) * 6.0 * hue;
  	} else if ((2.0 * hue) < 1.0) {
		ret = f2;
	} else if ((3.0 * hue) < 2.0) {
		ret = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
  	} else {
    	ret = f1;
  	}
	
	return ret;
}
`;

// A cool GLSL shader function to convert HSL values to RGB values
const HSLToRGB = HUEToRGB + `
vec3 HSLToRGB(vec3 hsl) {
	vec3 rgb = vec3(hsl.z);
	
	if (hsl.y != 0.0) {
		float f2;
		
		if (hsl.z < 0.5) {
			f2 = hsl.z * (1.0 + hsl.y);
    	} else {
     		 f2 = (hsl.z + hsl.y) - (hsl.y * hsl.z);
    	}
			
		float f1 = 2.0 * hsl.z - f2;
		
		rgb.r = HUEToRGB(f1, f2, hsl.x + (1.0 / 3.0));
		rgb.g = HUEToRGB(f1, f2, hsl.x);
		rgb.b = HUEToRGB(f1, f2, hsl.x - (1.0 / 3.0));
  	}
  
  	return rgb;
}
`;

// GLSL shader function to convert RGB values to HSL values
const RGBToHSL = `
vec3 RGBToHSL(vec3 color) {
  	vec3 hsl = vec3(0.0, 0.0, 0.0);
	
 	float fmin = min(min(color.r, color.g), color.b);
  	float fmax = max(max(color.r, color.g), color.b);
  	float delta = fmax - fmin;
  	hsl.z = (fmax + fmin) / 2.0;

  	if (delta == 0.0) {
		hsl.x = 0.0;
		hsl.y = 0.0;
	} else {
		if (hsl.z < 0.5) {
			hsl.y = delta / (fmax + fmin);
    	} else {
      		hsl.y = delta / (2.0 - fmax - fmin);
    	}
		
		float dR = (((fmax - color.r) / 6.0) + (delta / 2.0)) / delta;
		float dG = (((fmax - color.g) / 6.0) + (delta / 2.0)) / delta;
    	float dB = (((fmax - color.b) / 6.0) + (delta / 2.0)) / delta;
    
		if (color.r == fmax) {
			hsl.x = dB - dG;
    	} else if (color.g == fmax) {
			hsl.x = (1.0 / 3.0) + dR - dB;
		} else if (color.b == fmax) {
      		hsl.x = (2.0 / 3.0) + dG - dR;
    	}

		if (hsl.x < 0.0) {
			hsl.x += 1.0;
    	} else if (hsl.x > 1.0) {
      		hsl.x -= 1.0;
    	}
  	}
  
	return hsl;
}
`;

// The first real shader, used for setting the Hue, Saturation and Luminance of the image
const HSLShader = `
// WebGL quality switch
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define highmedp highp
#else
#define highmedp mediump
#endif
precision highmedp float;

precision mediump float;

// Scene buffer variables (these are set by Phaser)
uniform sampler2D uMainSampler; 
varying vec2 outTexCoord;

// Effect parameters (can be set from JS)
uniform float hueRotate;
uniform float satAdjust;
uniform float lumAdjust;

`
// Include the RGBToHSL and HSLToRGB functions
+ RGBToHSL + HSLToRGB + 
`
// Main shader program
void main(void) {
  	// Since for some reason images processed through a shader a flipped, we manually y-flip the image again
  	// by creating new texture coordinates
  	vec2 newTexCoord = outTexCoord.xy;
  	newTexCoord.y = 1.0 - newTexCoord.y;

  	// Sample the scene texture using the mainSampler and the flipped UV coordinates
  	vec4 image = texture2D(uMainSampler, newTexCoord);

  	// Convert the scene texture's rgb data to HSL values
  	vec3 hsl = RGBToHSL(image.rgb);
  
  	// Apply the HSL parameters
	hsl.x -= hueRotate;
	hsl.y *= satAdjust;
	hsl.z += (lumAdjust - 0.5) * image.a;
  
  	// Convert the HSL data back to RGB
  	vec3 rgb = HSLToRGB(hsl);

  	// This outputs the color of this fragment shader -> the end node of a shader program
  	gl_FragColor = vec4(rgb, 1.0);
}
`;

// Creates a new render pipeline used for applying the HSL shader
var HSLRenderPipeline = new Phaser.Class({
  	// Now this is funny: a lot of our objects use the Light2D pipeline, but we can still extend
  	// the TextureTint pipeline
  	Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,
  	initialize: function HSLRenderPipeline(game) {
    	// Acts like a "super" call
    	Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
      		game: game,
      		renderer: game.renderer,
      		fragShader: HSLShader
    	});

    	// Initialize the shader parameters to be their default values
    	this.setFloat1("hueRotate", 0); // 0: rotate 0 degrees, 0.5: rotate 180 degrees, 1: rotate 360 degrees
    	this.setFloat1("satAdjust", 1); // 0: gray, 1: original color
    	this.setFloat1("lumAdjust", 0.5); // 0: dark, 0.5: original color, 1: white
  	},
  	setHSL: function(h, s, l) {
    	this.setFloat1("hueRotate", h % 1);
    	this.setFloat1("satAdjust", s);
    	this.setFloat1("lumAdjust", l);
  	}
});

class PostProcess {
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
		// Now this is another cool hack, use two cameras, one for the UI, and one for the world.
		// If we would have used one camera for both, the UI would have been flipped aswell (remember,
		// the shader does flip the UV coords)
		this.gameCam = scene.cameras.main;
		this.uiCam = scene.cameras.add();

		// Create the HSL Render Pipeline
		this.hsl = scene.game.renderer.addPipeline("HSLRenderPipeline", new HSLRenderPipeline(scene.game));

		this.updateCameraFilter();
	}

	// Updates the camera filters
	updateCameraFilter() {
		// Main camera should ignore all UI elements as we render them on a different camera
		this.gameCam.ignore(window.game.ui.getAllUIElements());
		this.gameCam.ignore(helpers.getObjectSprites());
		this.gameCam.ignore(helpers.getFarmFieldSprites());

		// Camera 2 is the UI camera, so it should ignore everything else
		this.uiCam.ignore(window.game.map.getLayers());
		this.uiCam.ignore(window.game.map.lightingDummy);
		this.uiCam.ignore(window.game.map.mapSprites);

		// Set the main camera to render to the HSL shader pipeline
		this.gameCam.setRenderToTexture(this.hsl);

		// Set the UI cameras' bounds and start following the player just as the main camera does
		this.uiCam.setBounds(0, 0, window.game.map.tileMap.widthInPixels * CONSTANTS.GAME_SCALE, window.game.map.tileMap.heightInPixels * CONSTANTS.GAME_SCALE);
		this.uiCam.startFollow(window.game.player.playerSprite, true, 0.09, 0.09);
	}
	
    // Called when the game wants to update this object (every tick)
    update(scene, time, delta) {

	}	
}
