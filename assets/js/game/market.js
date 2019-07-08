/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: market.js
    Purpose: Market Game Object
*/

function marketClosed() {
    bounceOut(document.getElementById('inv-window'));

    // Change the sprite's frame to the closed version
    window.game.currentChest.interactable.setFrame(0);

    // Play the chest close sound
    window.game.currentChest.interactable.playSound(0);

    // Sell the market's contents
    window.game.market.sellContents();

    // Reset the current chest
    window.game.currentChest = null;
}

class Market {
    // Default constructor
    constructor(x, y) {
        // Initialize a new inventory with 30 slots
        this.inventory = new Inventory(30);

        // Create the template for the interactable component
        const marketTemplate = {
            name: "Market",
            id: "market",
            sprite: "assets/img/objects/market.png",
            frameHeight: 48,
            frameWidth: 64,
            displayHeight: 48*3,
            displayWidth: 64*3,
            onInteract: this.onInteract.bind(this),
            sounds: ["assets/sound/crate-open.wav", "assets/sound/crate-close.wav"]
        };

        // Register the interactable component with the given template, this also adds it to screen
        this.interactable = new Interactable(x+38, y+((48*3)/2)+4, marketTemplate);

        // There only can be one market, and this globally references it
        window.game.market = this;
    }

    // Called when the user interacts with this chest
    onInteract(interactable) {
        console.log("Opening chest " + interactable.template.name);

        // Set the global currentChest to this inventory, so the window can update
        window.game.currentChest = this;

        // Update the inventory chest window
        updateInventoryChest();

        // Since the chest uses the same window, we can update the title and hook the close button
        document.getElementById("inv-window-title").innerHTML = "Market";
        document.getElementById("inv-window-close-btn").onclick = marketClosed;

        // Show the inventory window
        bounceIn(document.getElementById("inv-window"));

        // Change the sprite's frame to the open version
        this.interactable.setFrame(1);

        // Play the chest open sound
        this.interactable.playSound(0);
    }

    // Sells all contents of the market
    sellContents() {
        // Holds the total value of all items
        var total = 0;

        // Go through all items in this market
        this.inventory.getItems().forEach(function(item) {
            if (item != ITEM_NONE) {
                // Add the item's sell price scaled by the amount of items
                total += item.amount * item.item.sellPrice;
            }
        });

        // If anything was sold, add the cash to the player and clear the market's inventory
        if (total > 0) {
            window.game.player.addCash(total);
            this.inventory = new Inventory(30);
        }
    }
}
