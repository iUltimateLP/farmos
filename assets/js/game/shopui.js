/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: shopui.js
    Purpose: UI functions for the Shop UI
*/

// Creates a HTML element for a shop item for use in the shop list
function createShopListItem(shopItem) {
    // Root div
    var divRoot = document.createElement("div");
    divRoot.classList.add("item");

    // Picture div
    var itemPic = document.createElement("div");
    itemPic.classList.add("item-pic");
    itemPic.style.backgroundImage = "url(\"" + shopItem.sprite + "\")";

    // Check if this item is unlocked, if not, render it as disabled
    if (!window.game.player.unlockedItems.includes(shopItem.plant)) {
        divRoot.classList.add("disabled");

        // Add a level needed paragraph
        var itemLevelNeeded = document.createElement("p");
        itemLevelNeeded.classList.add("item-level-needed");
        itemLevelNeeded.innerHTML = "LEVEL " + (shopItem.levelNeeded + 1);
        divRoot.appendChild(itemLevelNeeded);
    }

    // Texts div
    var divItemTexts = document.createElement("div");
    divItemTexts.classList.add("item-texts");

    // Item Name paragraph
    var itemName = document.createElement("p");
    itemName.classList.add("item-name");
    itemName.innerHTML = shopItem.friendlyName;

    // Item Description paragraph
    var itemDesc = document.createElement("p");
    itemDesc.classList.add("item-desc");
    itemDesc.innerHTML = shopItem.tooltip;

    // Buy Button
    var divItemBuy = document.createElement("div");
    divItemBuy.classList.add("item-buy");

    // Check if the player has enough cash to buy this item and if this item is unlocked
    if (window.game.player.getCash() >= shopItem.buyPrice && window.game.player.unlockedItems.includes(shopItem.plant)) {
        // Register an onclick handler for the buy button
        divItemBuy.onclick = function(event) {
            // Try to add the item to inventory
            playUIClick();

            if (window.game.player.inventory.addItem(shopItem, 5)) {
                // Subtract the buy price from the player's cash by adding -price
                window.game.player.addCash(shopItem.buyPrice * -1);

                // Reload the complete shop window
                populateStore();
            }
        }

        // Hover sound effect
        divItemBuy.onmouseover = function() {
            playUIHover();
        }
    } else {
        // No money? Disable the button
        divItemBuy.classList.add("disabled");
    }

    // Price paragraph
    var itemPrice = document.createElement("p");
    itemPrice.innerHTML = "$ " + shopItem.buyPrice;

    // Assemble the layout
    divRoot.appendChild(itemPic);

    divItemTexts.appendChild(itemName);
    divItemTexts.appendChild(itemDesc);

    divRoot.appendChild(divItemTexts);

    divItemBuy.appendChild(itemPrice);

    divRoot.appendChild(divItemBuy);

    // Return the finished shop item element
    return divRoot;
}

// Populates the whole store list
function populateStore() {
    // Get the shop window and clear it
    var shopWindow = document.getElementById("shop-window-content");
    shopWindow.innerHTML = "";

    // All items which should be in shop
    var itemsInShop = [ITEM_BROCCOLI_SEEDS, ITEM_CARROT_SEEDS, 
        ITEM_CHILI_SEEDS, ITEM_CORN_SEEDS, 
        ITEM_GARLIC_SEEDS, ITEM_GINGER_SEEDS, 
        ITEM_POTATO_SEEDS, ITEM_PUMPKIN_SEEDS,
        ITEM_TOMATO_SEEDS, ITEM_WHEAT_SEEDS];

    // Sort the items in shop by price
    itemsInShop.sort(function(a, b) {
        if (a.buyPrice < b.buyPrice) {
            // Order b before a
            return -1;
        } else {
            // Stay like it is
            return 0;
        }
    })

    // Go through all sorted items and create their shop list items
    itemsInShop.forEach(function(item) {
        // Append them to the shop window content
        shopWindow.appendChild(createShopListItem(item));
    });
}
