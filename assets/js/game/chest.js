/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: chest.js
    Purpose: Chest Game Object
*/
   
function chestClosed() {
    bounceOut(document.getElementById('inv-window'));

    // Change the sprite's frame to the closed version
    window.game.currentChest.interactable.setFrame(0);

    // Play the chest close sound
    window.game.currentChest.interactable.playSound(1);

    // Reset the current chest
    window.game.currentChest = null;
}

class Chest {
    // Default constructor
    constructor(x, y) {
        // Initialize a new inventory with 30 slots
        this.inventory = new Inventory(30);

        // Create the template for the interactable component
        const chestTemplate = {
            name: "Chest",
            id: "chest",
            sprite: "assets/img/objects/chest.png",
            frameHeight: 32,
            frameWidth: 32,
            displayHeight: 96,
            displayWidth: 96,
            onInteract: this.onInteract.bind(this),
            sounds: ["assets/sound/crate-open.wav", "assets/sound/crate-close.wav"]
        };

        // Register the interactable component with the given template, this also adds it to screen
        this.interactable = new Interactable(x, y, chestTemplate);
    }

    // Called when the user interacts with this chest
    onInteract(interactable) {
        // Set the global currentChest to this inventory, so the window can update
        window.game.currentChest = this;

        // Update the inventory chest window
        updateInventoryChest();

        // Since the market uses the same UI, we can update the window title and hook the close button
        document.getElementById("inv-window-title").innerHTML = "Chest";
        document.getElementById("inv-window-close-btn").onclick = chestClosed;

        // Show the inventory window
        bounceIn(document.getElementById("inv-window"));

        // Change the sprite's frame to the open version
        this.interactable.setFrame(1);

        // Play the chest open sound
        this.interactable.playSound(0);
    }
}
