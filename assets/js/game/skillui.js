/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: skillui.js
    Purpose: Handles the logic for the UI's skill window
*/

// All items which are in the skill tree, in order
const ITEMS_FOR_SKILL = [
    ITEM_APPLE, ITEM_WHEAT,
    ITEM_POTATO, ITEM_PEAR,
    ITEM_LEMON, ITEM_CARROT,
    ITEM_ORANGE, ITEM_TOMATO,
    ITEM_CHERRY, ITEM_BROCCOLI,
    ITEM_PEACH, ITEM_CORN,
    ITEM_WALNUTS, ITEM_PUMPKIN,
    ITEM_KIWI, ITEM_CHILI,
    ITEM_PINEAPPLE, ITEM_GARLIC,
    ITEM_DURIAN, ITEM_GINGER
];

// Creates a HTML element for a unlockable item in the skill tree
function createSkillItem(item, index) {
    // Item div
    var itemDiv = document.createElement("div");
    itemDiv.classList.add("item");
    itemDiv.id = "skill-item-" + index;
    itemDiv.setAttribute("tooltip", "");

    // Item Picture
    var itemPic = document.createElement("div");
    itemPic.classList.add("item-pic");
    itemPic.style.backgroundImage = "url(\"" + item.sprite + "\")";

    // Checkmark shown when the item is unlocked
    var checkMark = document.createElement("div");
    checkMark.classList.add("check");

    // Register an onclick handler
    itemDiv.onclick = function(event) {
        // If the player's lavel is enough and the player didn't unlock this yet
        if (window.game.player.getLevel() >= item.levelNeeded && !window.game.player.unlockedItems.includes(item)) {
            // Unlock the item
            window.game.player.unlockItem(item);

            // Append the checkmark
            itemDiv.appendChild(checkMark);

            // Flash this element
            itemDiv.classList.add("flash-fast");
            setTimeout(function() {
                itemDiv.classList.remove("flash-fast");
            }, 500);

            // Go through all fruit trees and check if we can unlock them now
            window.game.farm.fruitTrees.forEach(function(fruitTree) {
                if (fruitTree.fruit == item && fruitTree.isLocked) {
                    fruitTree.setLocked(false);
                }
            })

            // Repopulate the store so new items will be buyable
            populateStore();
        }
    }

    // Append the picture to the item div
    itemDiv.appendChild(itemPic);

    // Initially set the check marks on unlocked items
    if (window.game.player.unlockedItems.includes(item)) {
        itemDiv.appendChild(checkMark);

        // Also initially unlock the trees which are unlocked from start
        window.game.farm.fruitTrees.forEach(function(fruitTree) {
            if (fruitTree.fruit == item && fruitTree.isLocked) {
                fruitTree.setLocked(false);
            }
        })
    };

    // Return the created div
    return itemDiv;
}

// Creates a whole row for use in the skill tree
function createSkillRow(item, index) {
    // Skill Tree rows can have three different styles (left aligned, right aligned, centered)
    var style = index % 3;

    // Row div
    var row = document.createElement("div");
    row.classList.add("row");

    // Create the skill item div
    var itemDiv = createSkillItem(item, index);

    // Make it float right on the 2nd style
    if (style == 1) {
        itemDiv.classList.add("float-right");
    }

    // If this is not the last item in the chain
    if (index < ITEMS_FOR_SKILL.length - 1) {
        // Create the horizontal line
        var line = document.createElement("div");
        line.classList.add("line");
        if (style == 1) {
            line.classList.add("half");
            line.classList.add("float-right");
        } else if (style == 2) {
            line.classList.add("half");
        }

        // Create the edge 
        var edge = document.createElement("div");
        edge.classList.add("edge");
        if (style == 1) {
            edge.classList.add("left");
            edge.classList.add("float-right");
        } else if (style == 2) {
            edge.classList.add("left");
        }
        
        // If it should be locked, assign that to all three elements
        if (window.game.player.getLevel() < item.levelNeeded) {
            line.classList.add("locked");
            itemDiv.classList.add("locked");
            edge.classList.add("locked");
        }

        // Set up the layout according to the style
        if (style == 0) {
            row.appendChild(itemDiv);
            row.appendChild(line);
            row.appendChild(edge);
        } else if (style == 1) {
            row.appendChild(itemDiv);
            row.appendChild(line);
            row.appendChild(edge);
        } else if (style == 2) {
            row.appendChild(edge);
            row.appendChild(line);
            row.appendChild(itemDiv);
        }
    } else {
        // The last item in the chain just gets the item div, no lines
        row.appendChild(itemDiv);

        // Check for locked
        if (window.game.player.getLevel() < item.levelNeeded) {
            itemDiv.classList.add("locked");
        }
    }

    // Return the created row
    return row;
}

// Populates the skill tree
function populateSkillTree() {
    // Get the skill tree DOM element and clear it
    var skillTree = document.getElementById("skill-tree");
    skillTree.innerHTML = "";

    // Initially unlock the apple and the wheat
    if (!window.game.player.unlockedItems.includes(ITEM_APPLE) && !window.game.player.unlockedItems.includes(ITEM_WHEAT)) {
        window.game.player.unlockedItems.push(ITEM_APPLE);
        window.game.player.unlockedItems.push(ITEM_WHEAT);
    }

    // Create a row for each skill tree item
    ITEMS_FOR_SKILL.forEach(function(item, index) {
        skillTree.appendChild(createSkillRow(item, index));
    });

    // Resetup tooltips
    setupTooltips();
    
    // Repopulate the store
    populateStore();
}
