/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: inventoryui.js
    Purpose: Contains functions for all the inventory UI methods
*/

// Creates the inner of a tooltip
function createTooltipContent(item) {
    var rootDiv = document.createElement("div");

    var itemName = document.createElement("p");
    itemName.classList.add("item-name");
    itemName.innerHTML = item.friendlyName;

    var itemDesc = document.createElement("p");
    itemDesc.classList.add("item-desc");
    itemDesc.innerHTML = item.tooltip;

    var itemMeta = document.createElement("p");
    itemMeta.classList.add("item-meta");

    if (item.levelNeeded != undefined) {
        itemMeta.innerHTML += "Needs LVL " + (item.levelNeeded + 1) + "<br>";
    }

    if (item.buyPrice) {
        itemMeta.innerHTML += "Buy Price: $" + item.buyPrice + "<br>";
    }

    if (item.sellPrice) {
        itemMeta.innerHTML += "Sell Price: $" + item.sellPrice + "<br>";
    }

    rootDiv.appendChild(itemName);
    rootDiv.appendChild(itemDesc);
    rootDiv.appendChild(itemMeta);

    return rootDiv;
}

// Attaches a tooltip to a specified HTML element
function attachTooltip(elem) {
    // Get the tooltip HTML element
    var tooltip = document.getElementById("tooltip");

    // Register a onmousemove handler for the element
    elem.onmousemove = function(e) {
        // Figure out how to offset the tooltip from the mouse and where to place it
        var tooltipRect = tooltip.getBoundingClientRect();

        var offsetX = 10;
        var offsetY = ((tooltipRect.height) * -1) - 10;
        var x = e.clientX + offsetX;
        var y = e.clientY + offsetY;

        // Apply the tooltip position
        tooltip.style.left = x + "px";
        tooltip.style.top = y + "px";
    }

    // Register a onmouseenter handler used for showing the tooltip
    elem.onmouseenter = function(e) {
        // Clear the tooltip's content
        tooltip.innerHTML = "";

        // Decide which type of tooltip this is
        if (e.target.id.includes("inv-hotbar-")) {
            var slotIdxStr = e.target.id.replace("inv-hotbar-", "");
            var slotIdx = parseInt(slotIdxStr) - 1;

            var invItem = window.game.player.inventory.items[slotIdx];

            if (invItem != ITEM_NONE) {
                tooltip.style.visibility = "visible";
                tooltip.innerHTML = createTooltipContent(invItem.item).innerHTML;
            }

        } else if (e.target.id.includes("inv-grid-")) {
            var slotIdxStr = e.target.id.replace("inv-grid-", "");
            var slotIdx = parseInt(slotIdxStr) - 1;

            if (window.game.currentChest) {
                var invItem = window.game.currentChest.inventory.items[slotIdx];

                if (invItem != ITEM_NONE) {
                    tooltip.style.visibility = "visible";
                    tooltip.innerHTML = createTooltipContent(invItem.item).innerHTML;
                }
            }
        } else if (e.target.id.includes("skill")) {
            tooltip.style.visibility = "visible";
            var skillIndexStr = e.target.id.replace("skill-item-", "");
            var skillIndex = parseInt(skillIndexStr);

            tooltip.innerHTML = createTooltipContent(ITEMS_FOR_SKILL[skillIndex]).innerHTML;
        }
    }

    // Register a onmouseleave handler used for hiding the tooltip
    elem.onmouseleave = function(e) {
        // Hide the tooltip
        tooltip.style.visibility = "hidden";
    }
}

// Attaches tooltips to all HTML elements marked to display tooltips
function setupTooltips() {
    var elements = getAllElementsWithAttribute("tooltip");
    elements.forEach(function(element) {
        attachTooltip(element);
    });
}

// A few flags
var hasItemInHand = false;
var itemInHandIndex = -1;
var itemInHandElem = undefined;

function updateItemInHandCount(newCount) {
    itemInHandElem.childNodes[0].innerHTML = newCount;
    if (newCount == 0) {
        itemInHandElem.remove();

        wasAbleToMoveItem = false;
        hasItemInHand = false;
        itemInHandIndex = -1;
        window.game.itemInHand = undefined;
        window.game.itemInHandIdx = -1;
        itemInHandElem = undefined;
        
        // Call this again to rerender the hotbar
        updateInventoryHotbar();
        updateInventoryChest();
    }
}

// A big function, creates a HTML div element for an inventory item and registers all it's handlers
function createItemElement(invItem, index) {
    // Make sure the item is actually an item
    if (invItem != ITEM_NONE) {
        // Create a new div element for the item and add the CSS class
        var itemDiv = document.createElement("div");
        itemDiv.classList.add("inv-item");

        // The ID is constructed from the item name and a random integer as a UID
        itemDiv.id = "inv-item-" + invItem.item.name + "-" + (Math.floor(Math.random() * 1024));

        // Register a onclick handler for attaching the item to the mouse
        itemDiv.onclick = function(event) {
            // Ignore if the player already has an item in hand
            if (hasItemInHand) {
                return;
            }
            
            // Will hold the inventory this item originates from
            var sourceInventory;

            // Check if the item was contained in a chest or in the player's inv by checking down the event bubble path
            if (event.path.includes(document.getElementsByClassName("inventory")[0])) {
                sourceInventory = window.game.player.inventory;
            } else if (event.path.includes(document.getElementsByClassName("inv-grid")[0])) {
                sourceInventory = window.game.currentChest.inventory;
            }

            // Get the item we want to move around
            var sourceItem = sourceInventory.items[index];

            // Set flags
            hasItemInHand = true;
            itemInHandIndex = index;

            // We'll store the item the player has in hands globally, e.g. for farm fields
            window.game.itemInHand = sourceItem;
            window.game.itemInHandIdx = index;

            // Get the original item div which was clicked, and clone it (the cloned version is the one we attach to the mouse)
            var e = document.getElementById(event.target.id);
            var clone = e.cloneNode(true);

            // Calculate an offset for moving the attached element
            var offsetX = -1 * clone.getBoundingClientRect().width / 1;
            var offsetY = -1 * clone.getBoundingClientRect().height / 1;
            
            // The object attached to the mouse needs to be at fixed screen position
            clone.style.position = "fixed";
            clone.style.left = (event.clientX + offsetX) + "px";
            clone.style.top = (event.clientY + offsetY) + "px";
            clone.style.pointerEvents = "none"; // Disable mouse hit-testing

            itemInHandElem = clone;

            // Remove the original node from screen and append the clone to the game-ui container
            e.remove();
            document.getElementById("game-ui").appendChild(clone);

            // Register a GLOBAL onmousemove handler
            document.onmousemove = function(mouseMoveEvent) {
                // Update the clone's screen position to the mouse position
                clone.style.left = (mouseMoveEvent.clientX + offsetX) + "px";
                clone.style.top = (mouseMoveEvent.clientY + offsetY) + "px";
            }

            // Register a GLOBAL oncontextmenu handler: this is used for right clicking, weird enough
            document.oncontextmenu = function(contextMenuEvent) {
                // Decide the target inventory by looking at the target div slot
                var targetInventory;
                if (contextMenuEvent.target.id.includes("inv-hotbar")) {
                    targetInventory = window.game.player.inventory;

                    // Parse out the target index
                    var idxStr = contextMenuEvent.target.id.replace("inv-hotbar-", "");
                    var idx = parseInt(idxStr) - 1;

                    // Add one item to the target slot, and decimate the item amount the player holds in hands
                    targetInventory.addItemTo(sourceItem.item, 1, idx);
                    targetInventory.setItemAmount(index, sourceItem.amount-1);
                } else if (contextMenuEvent.target.id.includes("inv-grid")) {
                    targetInventory = window.game.currentChest.inventory;

                    // Parse out the hotbar item index we clicked
                    var idxStr = contextMenuEvent.target.id.replace("inv-grid-", "");
                    var idx = parseInt(idxStr) - 1;

                    // Add one item to the target slot, and decimate the item amount the player holds in hands
                    targetInventory.addItemTo(sourceItem.item, 1, idx);
                    targetInventory.setItemAmount(index, sourceItem.amount-1);
                }

                // The clone's small number needs to be updated
                clone.childNodes[0].innerHTML = targetInventory.getItemAmount(index);

                // Call this again to rerender the hotbar
                updateInventoryHotbar();
                updateInventoryChest();

                // Disables the browser built-in functionality
                return false;
            }

            // Register a GLOBAL onclick handler: used for dropping the item
            document.onclick = function(clickEvent) {
                // Stores whether the transaction worked
                var wasAbleToMoveItem = false;

                // First of all, check if we tried to drop the item on a hotbar or grid slot
                if (clickEvent.target.id.includes("inv-hotbar") || clickEvent.target.id.includes("inv-grid")) {
                    // Decide the target inventory
                    var targetInventory;
                    if (clickEvent.target.id.includes("inv-hotbar")) {
                        targetInventory = window.game.player.inventory;
                    } else if (clickEvent.target.id.includes("inv-grid")) {
                        targetInventory = window.game.currentChest.inventory;
                    }

                    // Now differentiate, did we click the hotbar?
                    if (clickEvent.target.id.includes("inv-hotbar")) {
                        // Parse out the hotbar item index we clicked
                        var idxStr = clickEvent.target.id.replace("inv-hotbar-", "");
                        var idx = parseInt(idxStr) - 1;

                        // Make sure we update the transaction in the player's inventory
                        wasAbleToMoveItem = window.game.player.inventory.transactItem(sourceInventory, index, targetInventory, idx);
                    } else if (clickEvent.target.id.includes("inv-grid")) {
                        // Parse out the hotbar item index we clicked
                        var idxStr = clickEvent.target.id.replace("inv-grid-", "");
                        var idx = parseInt(idxStr) - 1;

                        wasAbleToMoveItem = window.game.player.inventory.transactItem(sourceInventory, index, targetInventory, idx);
                    }

                    if (!wasAbleToMoveItem) {
                        console.log("Can't move item - target slot is probably full");
                        return;
                    }

                    // Create a new div for the item, again by cloning the clone we have in hand
                    var newE = clone.cloneNode(true);

                    // Reset the style variables we set during the mouse attachment
                    newE.style.left = null;
                    newE.style.top = null;
                    newE.style.position = "absolute";
                    newE.style.pointerEvents = "all";

                    // Reset the global event handlers
                    document.onmousemove = null;
                    document.onclick = null;
                    document.oncontextmenu = null;

                    // Add the newly created element to the clicked inventory slot and remove the clone
                    document.getElementById(clickEvent.target.id).appendChild(newE);
                    clone.remove();

                    wasAbleToMoveItem = false;
                    hasItemInHand = false;
                    itemInHandIndex = -1;
                    window.game.itemInHand = undefined;
                    window.game.itemInHandIdx = -1;
                    itemInHandElem = undefined;
                    
                    // Call this again to rerender the hotbar
                    updateInventoryHotbar();
                    updateInventoryChest();
                } else if (clickEvent.target.id.includes("inv-item") && hasItemInHand) {
                    /*console.log("Stacking");

                    // Find the slot index this item sits in
                    var slotIdx = -1;
                    var targetInventory;
                    clickEvent.path.forEach(function(p, i) {
                        //console.dir(p);
                        if (p.id) {
                            if (p.id.includes("inv-hotbar")) {
                                targetInventory = window.game.player.inventory;
                                if (slotIdx < 0) {
                                    var idxStr = p.id.replace("inv-hotbar-", "");
                                    var idx = parseInt(idxStr) - 1;

                                    slotIdx = idx;
                                }
                            } else if (p.id.includes("inv-grid")) {
                                targetInventory = window.game.currentChest.inventory;
                                if (slotIdx < 0) {
                                    var idxStr = p.id.replace("inv-grid-", "");
                                    var idx = parseInt(idxStr) - 1;

                                    slotIdx = idx;                                    
                                }
                            }
                        }
                    })

                    console.log("This item chills in " + slotIdx);

                    console.dir(sourceInventory);
                    console.dir(targetInventory);*/

                }
            }
        }

        // Put the sprite's URL relative to the root of the game folder
        var spriteURL = "../../../../" + invItem.item.sprite;

        // Apply the sprite to the div element of the item
        itemDiv.style.backgroundImage = "url(\"" + spriteURL + "\")";

        // If we have more than one item in the current stack
        if (invItem.amount > 1) {
            // Create a label displaying the stack amount
            var amountLabel = document.createElement("p");
            amountLabel.classList.add("inv-item-amount");
            amountLabel.innerHTML = invItem.amount;

            // And add it to the item's div
            itemDiv.appendChild(amountLabel);
        }

        return itemDiv;
    } else {
        return null;
    }
}

function updateInventoryHotbar() {
    // Collect all the hotbar slot elements
    var hotbarContainers = [];
    for (i = 1; i < 11; i++) {
        hotbarContainers.push(document.getElementById("inv-hotbar-" + i));
    }
    
    // Go through each hotbar container
    hotbarContainers.forEach(function(hotbarContainer, index) {
        // Clear it
        hotbarContainer.innerHTML = "";

        // Retrieve the item from the player's inventory
        var invItem = window.game.player.inventory.items[index];

        if (invItem != ITEM_NONE && itemInHandIndex != index) {
            // Create the element for the inv items and append the item div to the current hotbar container
            hotbarContainer.appendChild(createItemElement(invItem, index));
        }
    });

    // Finally rehook tooltips
    setupTooltips();
}

function updateInventoryChest() {
    // Check if a current chest is set
    if (!window.game.currentChest) {
        return;
    }

    // Collect all the inventory item slots
    var chestContainers = [];
    for (i = 1; i < 19; i++) {
        chestContainers.push(document.getElementById("inv-grid-" + i));
    }

    // Go through each chest container
    chestContainers.forEach(function(chestContainer, index) {
        // Clear it
        chestContainer.innerHTML = "";

        // Retrieve the item which sits in this slot
        var invItem = window.game.currentChest.inventory.items[index];

        if (invItem != ITEM_NONE && itemInHandIndex != index) {
            // Create the element for the inv items and append the item div to the current chest container
            chestContainer.appendChild(createItemElement(invItem, index));
        }
    });

    // Rehook tooltips
    setupTooltips();
}

// Initially hook tooltips
setupTooltips();
