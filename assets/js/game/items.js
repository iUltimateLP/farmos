/*
	 ______      _____  __  __  ____   _____ 
	|  ____/\   |  __ \|  \/  |/ __ \ / ____|
	| |__ /  \  | |__) | \  / | |  | | (___  
	|  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
	| | / ____ \| | \ \| |  | | |__| |____) |
	|_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
											
	David Peter Lothar Bollmann - 5042634
	Jonathan Verbeek - 5058288

	File: items.js
	Purpose: Holds all the item definitions for the items in the game
*/

/*
	name: Internal name used for this item
	friendlyName: Name displayed in the UI
	sprite: Image used for this item
	tooltip: Tooltip description for the UI
	stackSize: the maximum stack size
	type: can be "farm", "fruit" or "seed",
	growTime: Time in hours this needs to completely grow
	buyPrice: Price for buying this item in the shop. (Not defining one means it doesn't appear in the shop)
	sellPrice: Price for selling this on the market. (Not defining one means it can't be sold)
	xpGain: How much XP the player gains when receiving this item
	levelNeeded: Which level the player needs to buy these or use the tree
*/

/*
	lv 1: 0-999xp
	lv 2: 1000-1999xp
	lv 3: 2000-3999xp
	lv 4: 4000-7999xp
	lv 5: 8000-15999xp
	lv 6: 16000-31999xp
	lv 7: 32000-127999xp
	lv 8: 128000-255999xp
	lv 9: 256000-511999xp
	lv 10: 512000-1000000xp

	lv 1: apple, wheat
	lv 2: pear, potato
	lv 3: lemon, carrot
	lv 4: orange, tomato
	lv 5: cherries, broccoli
	lv 6: peach, corn
	lv 7: walnut, pumpkin
	lv 8: kiwi, chili
	lv 9: pineapple, garlic
	lv 10: durian, ginger
*/

const XP_CAP = 1000000;
const XP_LEVELS = [
	0, 		// - 999
	1000, 	// - 1999
	2000, 	// - 3999
	4000, 	// - 7999
	8000, 	// - 15999
	16000,	// - 31999
	32000,	// - 127999
	128000,	// - 255999
	256000,	// - 511999
	512000	// - 1000000
]

const ITEM_APPLE = {
	name: "item-apple",
	friendlyName: "Apple",
	sprite: "assets/img/items/apple.png",
	tooltip: "An apple a day keeps the Aveng... wait",
	stackSize: 50,
	type: "fruit",
	growTime: 72,
	sellPrice: 75,
	xpGain: 100,
	levelNeeded: 0
};

const ITEM_BROCCOLI = {
	name: "item-broccoli",
	friendlyName: "Broccoli",
	sprite: "assets/img/items/broccoli.png",
	farmSheet: "assets/img/crops/broccoli.png",
	tooltip: "Does anyone even like these?",
	stackSize: 50,
	type: "farm",
	growTime: 168,
	sellPrice: 150,
	xpGain: 150,
	levelNeeded: 4
};

const ITEM_BROCCOLI_SEEDS = {
	name: "item-broccoli-seeds",
	friendlyName: "Broccoli Seeds",
	sprite: "assets/img/crops/broccoli-seeds.png",
	tooltip: "Does anyone even like these?",
	stackSize: 50,
	type: "seed",
	plant: ITEM_BROCCOLI,
	buyPrice: 200,
	levelNeeded: 4
};

const ITEM_CARROT = {
	name: "item-carrot",
	friendlyName: "Carrot",
	sprite: "assets/img/items/carrot.png",
	farmSheet: "assets/img/crops/carrot.png",
	tooltip: "Contains Vitamin B!",
	stackSize: 50,
	type: "farm",
	growTime: 120,
	sellPrice: 100,
	xpGain: 100,
	levelNeeded: 2
};

const ITEM_CARROT_SEEDS = {
	name: "item-carrot-seeds",
	friendlyName: "Carrot Seeds",
	sprite: "assets/img/crops/carrot-seeds.png",
	tooltip: "Contains Vitamin B!",
	stackSize: 50,
	type: "seed",
	plant: ITEM_CARROT,
	buyPrice: 150,
	levelNeeded: 2
};

const ITEM_CHERRY = {
	name: "item-cherry",
	friendlyName: "Cherry",
	sprite: "assets/img/items/cherries.png",
	tooltip: "My grandmother used to have a cherry tree...",
	stackSize: 50,
	type: "fruit",
	growTime: 168,
	sellPrice: 175,
	xpGain: 300,
	levelNeeded: 4
};

const ITEM_CHILI = {
	name: "item-chili",
	friendlyName: "Chili",
	sprite: "assets/img/items/chili.png",
	farmSheet: "assets/img/crops/chili.png",
	tooltip: "One spicy chili for twice the fun.",
	stackSize: 50,
	type: "farm",
	growTime: 240,
	sellPrice: 150,
	xpGain: 500,
	levelNeeded: 7,
};

const ITEM_CHILI_SEEDS = {
	name: "item-chili-seeds",
	friendlyName: "Chili Seeds",
	sprite: "assets/img/crops/chili-seeds.png",
	tooltip: "One spicy chili for twice the fun.",
	stackSize: 50,
	type: "seed",
	plant: ITEM_CHILI,
	buyPrice: 500,
	levelNeeded: 7
};

const ITEM_CORN = {
	name: "item-corn",
	friendlyName: "Corn",
	sprite: "assets/img/items/corn.png",
	farmSheet: "assets/img/crops/corn.png",
	tooltip: "I am.. Indigestable.",
	stackSize: 50,
	type: "farm",
	growTime: 192,
	sellPrice: 175,
	xpGain: 175,
	levelNeeded: 5
};

const ITEM_CORN_SEEDS = {
	name: "item-corn-seeds",
	friendlyName: "Corn Seeds",
	sprite: "assets/img/crops/corn-seeds.png",
	tooltip: "I am.. Indigestable.",
	stackSize: 50,
	type: "seed",
	plant: ITEM_CORN,
	buyPrice: 225,
	levelNeeded: 5
};

const ITEM_DURIAN = {
	name: "item-durian",
	friendlyName: "Durian",
	sprite: "assets/img/items/durian.png",
	tooltip: "This will keep 'em away.",
	stackSize: 50,
	type: "fruit",
	growTime: 336,
	sellPrice: 1000,
	xpGain: 1000,
	levelNeeded: 9
};

const ITEM_GARLIC = {
	name: "item-garlic",
	friendlyName: "Garlic",
	sprite: "assets/img/items/garlic.png",
	farmSheet: "assets/img/crops/garlic.png",
	tooltip: "Don't forget to brush your teeth.",
	stackSize: 50,
	type: "farm",
	growTime: 264,
	sellPrice: 225,
	xpGain: 750,
	levelNeeded: 8
};

const ITEM_GARLIC_SEEDS = {
	name: "item-garlic-seeds",
	friendlyName: "Garlic Seeds",
	sprite: "assets/img/crops/garlic-seeds.png",
	tooltip: "Don't forget to brush your teeth.",
	stackSize: 50,
	type: "seed",
	plant: ITEM_GARLIC,
	buyPrice: 750,
	levelNeeded: 8
};

const ITEM_GINGER = {
	name: "item-ginger",
	friendlyName: "Ginger",
	sprite: "assets/img/items/ginger.png",
	farmSheet: "assets/img/crops/ginger.png",
	tooltip: "My favourite...",
	stackSize: 50,
	type: "farm",
	growTime: 336,
	sellPrice: 300,
	xpGain: 1000,
	levelNeeded: 9
};

const ITEM_GINGER_SEEDS = {
	name: "item-ginger-seeds",
	friendlyName: "Ginger Seeds",
	sprite: "assets/img/crops/ginger-seeds.png",
	tooltip: "My favourite...",
	stackSize: 50,
	type: "seed",
	plant: ITEM_GINGER,
	buyPrice: 1000,
	levelNeeded: 9
};

const ITEM_KIWI = {
	name: "item-kiwi",
	friendlyName: "Kiwi",
	sprite: "assets/img/items/kiwi.png",
	tooltip: "If a Kiwi would eat a Kiwi, would it be considered cannibalism?",
	stackSize: 50,
	type: "fruit",
	growTime: 240,
	sellPrice: 250,
	xpGain: 450,
	levelNeeded: 7
};

const ITEM_LEMON = {
	name: "item-lemon",
	friendlyName: "Lemon",
	sprite: "assets/img/items/lemon.png",
	tooltip: "Smells like public toilets.",
	stackSize: 50,
	type: "fruit",
	growTime: 120,
	sellPrice: 125,
	xpGain: 200,
	levelNeeded: 2
};

const ITEM_ORANGE = {
	name: "item-orange",
	friendlyName: "Orange",
	sprite: "assets/img/items/orange.png",
	tooltip: "Nice.",
	stackSize: 50,
	type: "fruit",
	growTime: 144,
	sellPrice: 150,
	xpGain: 250,
	levelNeeded: 3
};

const ITEM_PEACH = {
	name: "item-peach",
	friendlyName: "Peach",
	sprite: "assets/img/items/peach.png",
	tooltip: "Gamora used to like these...",
	stackSize: 50,
	type: "fruit",
	growTime: 192,
	sellPrice: 200,
	xpGain: 350,
	levelNeeded: 5
};

const ITEM_PEAR = {
	name: "item-pear",
	friendlyName: "Pear",
	sprite: "assets/img/items/pear.png",
	tooltip: "They're pretty nice for a fruit salad!",
	stackSize: 50,
	type: "fruit",
	growTime: 96,
	sellPrice: 100,
	xpGain: 150,
	levelNeeded: 1
};

const ITEM_PINEAPPLE = {
	name: "item-pineapple",
	friendlyName: "Pineapple",
	sprite: "assets/img/items/pineapple.png",
	tooltip: "Once a pineapple fell on my head. It hurt.",
	stackSize: 50,
	type: "fruit",
	growTime: 264,
	sellPrice: 500,
	xpGain: 500,
	levelNeeded: 8
};

const ITEM_POTATO = {
	name: "item-potato",
	friendlyName: "Potato",
	sprite: "assets/img/items/potato.png",
	farmSheet: "assets/img/crops/potato.png",
	tooltip: "A piece of german culture.",
	stackSize: 50,
	type: "farm",
	growTime: 96,
	sellPrice: 75,
	xpGain: 75,
	levelNeeded: 1
};

const ITEM_POTATO_SEEDS = {
	name: "item-potato-seeds",
	friendlyName: "Potato Seeds",
	sprite: "assets/img/crops/potato-seeds.png",
	tooltip: "A piece of german culture.",
	stackSize: 50,
	type: "seed",
	plant: ITEM_POTATO,
	buyPrice: 125,
	levelNeeded: 1
};

const ITEM_PUMPKIN = {
	name: "item-pumpkin",
	friendlyName: "Pumpkin",
	sprite: "assets/img/items/pumpkin.png",
	farmSheet: "assets/img/crops/pumpkin.png",
	tooltip: "Wait, you can eat these?",
	stackSize: 50,
	type: "farm",
	growTime: 216,
	sellPrice: 200,
	xpGain: 200,
	levelNeeded: 6
};

const ITEM_PUMPKIN_SEEDS = {
	name: "item-pumpkin-seeds",
	friendlyName: "Pumpkin Seeds",
	sprite: "assets/img/crops/pumpkin-seeds.png",
	tooltip: "Wait, you can eat these?",
	stackSize: 50,
	type: "seed",
	plant: ITEM_PUMPKIN,
	buyPrice: 250,
	levelNeeded: 6
};

const ITEM_TOMATO = {
	name: "item-tomato",
	friendlyName: "Tomato",
	sprite: "assets/img/items/tomato.png",
	farmSheet: "assets/img/crops/tomato.png",
	tooltip: "Nice and red.",
	stackSize: 50,
	type: "farm",
	growTime: 144,
	sellPrice: 125,
	xpGain: 125,
	levelNeeded: 3
};

const ITEM_TOMATO_SEEDS = {
	name: "item-tomato-seeds",
	friendlyName: "Tomato Seeds",
	sprite: "assets/img/crops/tomato-seeds.png",
	tooltip: "Nice and red.",
	stackSize: 50,
	type: "seed",
	plant: ITEM_TOMATO,
	buyPrice: 175,
	levelNeeded: 3
};

const ITEM_WALNUTS = {
	name: "item-walnut",
	friendlyName: "Walnut",
	sprite: "assets/img/items/walnuts.png",
	tooltip: "Where's my nutcracker?",
	stackSize: 50,
	type: "fruit",
	growTime: 216,
	sellPrice: 225,
	xpGain: 400,
	levelNeeded: 6
};

const ITEM_WATERMELON = {
	name: "item-watermelon",
	friendlyName: "Watermelon",
	sprite: "assets/img/items/watermelon.png",
	farmSheet: "assets/img/crops/watermelon.png",
	tooltip: "Honestly I love these. God I love watermelons. Yea they're great. Man I could really need a watermelon now.",
	stackSize: 50,
	type: "farm",
	growTime: 72,
	sellPrice: 50,
	xpGain: 0
};

const ITEM_WATERMELON_SEEDS = {
	name: "item-watermelon-seeds",
	friendlyName: "Watermelon Seeds",
	sprite: "assets/img/crops/watermelon-seeds.png",
	tooltip: "Honestly I love these. God I love watermelons. Yea they're great. Man I could really need a watermelon now.",
	stackSize: 50,
	type: "seed",
	plant: ITEM_WATERMELON,
	buyPrice: 100
};

const ITEM_WHEAT = {
	name: "item-wheat",
	friendlyName: "Wheat",
	sprite: "assets/img/items/wheat.png",
	farmSheet: "assets/img/crops/wheat.png",
	tooltip: "Cake, bread, cookies... yum!",
	stackSize: 50,
	type: "farm",
	growTime: 72,
	sellPrice: 50,
	xpGain: 50,
	levelNeeded: 0
};

const ITEM_WHEAT_SEEDS = {
	name: "item-wheat-seeds",
	friendlyName: "Wheat Seeds",
	sprite: "assets/img/crops/wheat-seeds.png",
	tooltip: "Cake, bread, cookies... yum!",
	stackSize: 50,
	type: "seed",
	plant: ITEM_WHEAT,
	buyPrice: 100,
	levelNeeded: 0
};
