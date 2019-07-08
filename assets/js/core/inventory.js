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

// An empty item
const ITEM_NONE = {};

class Inventory {
    // Default constructor
    constructor(size) {
        this.size = size;

        // Holds all the items. This holds object pairs associating items with their amount, like
        // this.items[0] = { item: ..., amount: 5 }
        this.items = [];

        // Initialize all item slots to be an empty item at first
        for (var i = 0; i < this.size; i++) {
            this.items.push(ITEM_NONE);
        }
    }

    // Returns all items in this inventory
    getItems() {
        return this.items;
    }

    // Counts how many items are stored
    getItemCount() {
        var count = 0;
        
        // Only count items that aren't none
        this.items.forEach(function(item) {
            if (item != ITEM_NONE) {
                count++;
            }
        })

        return count;
    }

    // Used to find a free slot for an item, takes stacking into account. Returns the index of the found sot
    findFreeSlot(item, amount) {
        // Our goal is to finish any stack first, then search for slots which are
        // free (rolled up from the start)
        // Example:
        //   [ ] [ ] [5] [5] [5] [3] [ ] [ ] [ ] [ ] +1
        //   [ ] [ ] [5] [5] [5] [4] [ ] [ ] [ ] [ ] +1
        //   [ ] [ ] [5] [5] [5] [5] [ ] [ ] [ ] [ ] +1
        //   [1] [ ] [5] [5] [5] [5] [ ] [ ] [ ] [ ] +1

        // First of all, we want to check if we have this item already in inventory.. If so, we'll traverse through the items
        // and check for a unfinished stack which we could fill up.
        var lastItemStoredIdx = -1;
        this.items.forEach(function(value, index) {
            if (value.item) {
                if (lastItemStoredIdx < 0 && value.item.name == item.name && (value.amount + amount) <= value.item.stackSize) {
                    lastItemStoredIdx = index;
                }
            }
        });

        // Find the first slot in the item array which is free / unoccupied
        var firstFreeSlotIdx = -1;
        this.items.forEach(function(value, index) {
            if (firstFreeSlotIdx < 0 && Object.keys(value).length == 0) {
                firstFreeSlotIdx = index;
            }
        });
        
        // Cast both indices down to items
        var lastItemStored = this.items[lastItemStoredIdx];
        var firstFreeSlot = this.items[firstFreeSlot];

        // If we found a valid last item (for stacking) return that index, otherwise the first free index
        if (lastItemStored) {
            return lastItemStoredIdx;
        } else {
            return firstFreeSlotIdx;
        }
    }

    // Inserts an item in the inventory and returns whether it was successful or not
    addItem(item, amount) {
        // Find a slot where we can place this item
        var itemStoredIdx = this.findFreeSlot(item, amount);

        //console.log("Adding item " + item.name + " to inventory. Preferred index: " + itemStoredIdx);

        // Make sure that the found index is valid
        if (itemStoredIdx >= 0) {
            // Update the item amount
            this.updateItemAmount(itemStoredIdx, item, amount);
            return true;
        }

        return false;
    }

    // Updates the item amount of an item in a slot. Takes placing of new items into account
    updateItemAmount(slot, item, amount) {
        // Cast the index to an item
        var itemAt = this.items[slot];

        // Is there nothing in the given slot?
        if (itemAt === ITEM_NONE) {
            // Then simply add a new item at that position
            this.items[slot] = {
                item: item,
                amount: amount
            };
        } 
        // Is an item of the same type already stored? Then we'll stac
        else if (itemAt.item.name === item.name) {
            // First check if the stack has enough capacity for us to add the items to
            if ((itemAt.amount + amount) <= itemAt.item.stackSize) {
                // Simply increase the stack's amount
                itemAt.amount += amount
            } 
            // If the stack doesn't have enough capacity
            else if ((itemAt.amount + amount) > itemAt.item.stackSize) {
                // Calculate the difference which remains after filling up the stack
                var difference = (itemAt.amount + amount) - itemAt.item.stackSize;

                // Set the current item's stack to full
                itemAt.amount = itemAt.item.stackSize;

                // Find a new free slot for the next stack
                var newSlot = this.findFreeSlot(itemAt, difference);

                // Make sure it's valid
                if (newSlot >= 0) {
                    // Recursively call this again. This repeats as much until the difference fits in a stack and all items are distributed evenly.
                    this.updateItemAmount(newSlot, itemAt, difference);
                }
            } else {
                console.log("Inventory full");
            }
        }

        // Update the inventory UI's hotbar
        updateInventoryHotbar();
    }

    // Inserts an item into a specified slot
    addItemTo(item, amount, slotIndex) {
        // Cast down the slot index to an item
        var itemStored = this.items[slotIndex];

        // Check if these items are the same, if so, just increase the amount
        if (itemStored.item.name == item.name) {
            itemStored.amount++;
        } else if (itemStored == ITEM_NONE) {
            // Create a new item at the slot
            this.items[slotIndex] = {
                item: item,
                amount: amount
            };
        } else {
            console.log("Can't stack");
        }

        updateInventoryHotbar();
    }

    // Sets item amount of an item in this inventory
    setItemAmount(index, amount) {
        if (this.items[index]) {
            if (amount > 0) {
                this.items[index].amount = amount;
            } else {
                this.items[index] = ITEM_NONE;
            }
        }
    }

    // Gets the item amount
    getItemAmount(index) {
        if (this.items[index]) {
            return this.items[index].amount;
        } else {
            return 0;
        }
    }

    // Moves an item from a slot to another slot
    moveItem(oldSlot, newSlot) {
        //console.log("Transacting from " + oldSlot + " to " + newSlot);
        
        // Only move if the old slot is valid and the new slot is empty
        if (this.items[oldSlot] != ITEM_NONE && this.items[newSlot] == ITEM_NONE) {
            this.items[newSlot] = this.items[oldSlot];
            this.items[oldSlot] = ITEM_NONE;
            return true;
        } 
        // If the user clicked on the same slot again, obviously it should work
        else if (oldSlot == newSlot) {
            return true;
        } else {
            return false;
        }
    }

    transactItem(oldInventory, oldSlot, newInventory, newSlot) {
        // console.log("Transacting from " + oldSlot + "(" + oldInventory.size + ") to " + newSlot + "(" + newInventory.size + ")");

        // Only move if the old slot is valid and the new slot is empty
        if (oldInventory.items[oldSlot] != ITEM_NONE && newInventory.items[newSlot] == ITEM_NONE) {
            newInventory.items[newSlot] = oldInventory.items[oldSlot];
            oldInventory.items[oldSlot] = ITEM_NONE;
            return true;
        } 
        // If the user clicked on the same slot again, obviously it should work
        else if (oldInventory == newInventory && oldSlot == newSlot) {
            return true;
        } else {
            return false;
        }
    }
}
