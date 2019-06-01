/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: inventory.js
    Purpose: Provides a universal inventory interface to the player, chests, etc.
*/

// An item looks like this:
/*
    {
        "name": "item-apple",
        "friendlyName": "Apple",
        "sprite": "assets/img/items/apple.png",
        "tooltip": "A nice, juicy apple!",
        "stackSize": "100",
        "type": "good" 
    }

    // Type "good" is a sellable and storable product, can't be used
    // Type "seed" is a plantable item, still storable but can be equipped to plant
    // Type "tool" is a usable tool, not stackable, not sellable, but can be used
*/

const TEST_ITEM = {
    name: "item-test",
    friendlyName: "Test Item",
    sprite: "assets/img/items/test.png",
    tooltip: "Testy test",
    stackSize: 50,
    type: "good"
};

class Inventory {
    // Default constructor
    constructor() {
        // Holds all the items. This holds object pairs associating items with their amount, like
        // this.items[0] = { item: ..., amount: 5 }
        this.items = [];
    }

    // Returns all items in this inventory
    getItems() {
        return this.items;
    }

    // Inserts an item in the inventory
    addItem(item, amount) {
        // Check if we already have this item in inventory, and if so, return the LAST one (due to stacking)
        var itemStored = this.items.reverse().find(function(value, index) {
            return value.item === item;
        });

        // If so, just update it's amount
        if (itemStored) {
            this.updateItemAmount(itemStored.item, amount);
        } else {
            // If not, push the item to our inventory but with amount zero
            this.items.push({
                item: item,
                amount: 0
            });

            // And now update the newly created item's amount using updateItemAmount to take stacking into account
            this.updateItemAmount(item, amount);            
        }
    }

    // Updates an item's amount, taking care of stacking
    updateItemAmount(item, amount) {
        // We can have multiple items of the same template in the inventory due to stacking
        // Here we find the LAST item of this type by using find (which returns the FIRST)
        // element matching the predicate) on a reversed array (to get the LAST)
        var itemStored = this.items.reverse().find(function(value, index) {
            return value.item === item;
        });

        // Check if the new amount would go over the item's max stack size
        if ((itemStored.amount + amount) > itemStored.item.stackSize) {
            // If so, we will need to split them, so first update the existing item amount to a full stack
            // First calculate how much we have left when making the first stack full
            var difference = (itemStored.amount + amount) - itemStored.item.stackSize;

            // Make the first stack full
            itemStored.amount = itemStored.item.stackSize;

            // Add a new item into the inventory (the same item template as the previous item obviously)
            // Note: the amount here is 0, because we will now update this item amount recursively using
            // updateItemAmount again. This way, on very big numbers, it would split again and again, until
            // the sizes are below the max stack size
            this.items.push({
                item: item,
                amount: 0
            });

            this.updateItemAmount(item, difference);
        } else {
            itemStored.amount += amount;
        }
    }
}
