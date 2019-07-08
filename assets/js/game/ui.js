/*
     ______      _____  __  __  ____   _____ 
    |  ____/\   |  __ \|  \/  |/ __ \ / ____|
    | |__ /  \  | |__) | \  / | |  | | (___  
    |  __/ /\ \ |  _  /| |\/| | |  | |\___ \ 
    | | / ____ \| | \ \| |  | | |__| |____) |
    |_|/_/    \_\_|  \_\_|  |_|\____/|_____/ 
                                            
    David Peter Lothar Bollmann - 5042634
    Jonathan Verbeek - 5058288

    File: ui.js
    Purpose: User Interface Manager
*/

// A handy prototype function to get a nice time/date string
Date.prototype.toNiceString = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
    var hh = this.getHours();
    var MM = this.getMinutes();
    var ss = this.getSeconds();

    return [(dd>9 ? "" : "0") + dd + ".",
            (mm>9 ? "" : "0") + mm + ".",
            this.getFullYear() + " ",
            (hh>9 ? "" : "0") + hh + ":",
            (MM>9 ? "" : "0") + MM + ":",
            (ss>9 ? "" : "0") + ss
        ].join("");
};

// Two very nice functions to let any UI element bounce!
function bounceIn(elem) {
    // Show the element
    elem.style.display = "block";

    // Remove any left over CSS classes
    elem.classList.remove("bounce-out");
    elem.classList.remove("bounce-in");

    // Workaround to force a reflow
    void elem.offsetWidth;

    // Start the bounce-in CSS anim
    elem.classList.add("bounce-in");
}

function bounceOut(elem) {
    // Remove any left over CSS classes
    elem.classList.remove("bounce-in");
    elem.classList.remove("bounce-out");

    // Workaround to force a reflow
    void elem.offsetWidth;

    // Start the bounce-out CSS anim
    elem.classList.add("bounce-out");

    // Wait until the anim completed then hide the element
    setTimeout(function() {
        elem.style.display = "none";
    }, 300);
}

// Lets any UI element flash
function flash(elem) {
    // Add the flash CSS class to start the animation (loops infinite)
    elem.classList.add("flash");
}

// Stops the flashing on an UI element
function noFlash(elem) {
    // Remove the flash CSS class
    elem.classList.remove("flash");
}

function playUIClick() {
    var audio = new Audio("assets/sound/click.wav");
    audio.play();
}

function playUIHover() {
    var audio = new Audio("assets/sound/hoverIn.wav");
    audio.volume = 0.8;
    audio.play();
}

function getAllElementsWithAttribute(attribute)
{
    var matchingElements = [];
    var allElements = document.getElementsByTagName('*');
    for (var i = 0, n = allElements.length; i < n; i++)
    {
        if (allElements[i].getAttribute(attribute) !== null)
        {
            // Element exists with attribute. Add to array.
            matchingElements.push(allElements[i]);
        }
    }
    return matchingElements;
}

class UIManager {
    // Default constructor
    constructor() {
        // Bind game events
        window.game.events.on("preload", this.preload, this);
        window.game.events.on("create", this.create, this);
        window.game.events.on("update", this.update, this);

        this.clockHourPointer = document.getElementById("clock-hour");
        this.clockMinutePointer = document.getElementById("clock-minute");
        this.dateLabel = document.getElementById("clock-date-label");
    }

    // Called when the game preloads assets for later use
    preload(scene) {

    }

    // Called when the game creates this object and places it on screen
    create(scene) {
        // Updating the clock at tick would be too overkill because updating the CSS layout
        // 60 times a second is hell of a performance killer. That's why the clock is updated
        // using a simple timeout timer of 50ms. This kicks it off.
        this.clockTick();
    }

    // Update the analog clock in the UI
    clockTick() {
        // Get the fractions for hours and minutes (0..1 value ranges after the division)
        var hour = window.game.time.now().getHours() / 12;

        // Since we divide through 12, 0:00 - 12:00 will be in 0..1 range, but 12:00 - 24:00 in range 1..2
        // For the hour pointer, we'll correct that
        if (hour > 1)
        {
            hour = hour - 1;
        }
        
        // Calculate the angles in degrees (the hour pointer takes a 10th fraction of the minute into account)
        // https://stackoverflow.com/questions/2748965/find-angle-between-hour-and-minute-hands-in-an-analog-clock
        var h = hour * 12;
        var m = window.game.time.now().getMinutes();

        // The hour pointer moves at 0.5 degrees per minute, the minute pointer 6 degrees per minute
        var hourAngle = 0.5 * (h * 60 + m);
        var minuteAngle = 6 * m;

        // Update the pointers rotation
        this.clockHourPointer.style.transform = "rotate(" + hourAngle + "deg)";
        this.clockMinutePointer.style.transform = "rotate(" + minuteAngle + "deg)";

        // Update the calendar's date
        var shortMonthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        var niceDay = (window.game.time.now().getDate() >= 10) ? window.game.time.now().getDate() : "0" + window.game.time.now().getDate();
        this.dateLabel.innerHTML = shortMonthNames[window.game.time.now().getMonth()] + " " + niceDay;

        // Schedule the next update
        setTimeout(this.clockTick.bind(this), 50);
    }

    // Called when the game wants to update this object (every tick)
    update(scene, time, delta) {
        
    }

    // Updates the cash display
    updateCashDisplay() {
        // Retrieve the cash from the player
        var cash = window.game.player.getCash();
        var cashLabel = document.getElementById("cash-label");

        // Set the cash label's value
        cashLabel.innerHTML = "$ " + cash;
        
        // Flash
        cashLabel.classList.add("flash-fast");
        setTimeout(function() {
            cashLabel.classList.remove("flash-fast");
        }, 500);

        // Populate the store to update new items
        populateStore();
    }

    // Updates the XP display
    updateXPDisplay() {
        // Retrieve the values and DOM objects needed
        var xp = window.game.player.getXP();
        var level = window.game.player.getLevel();
        var xpLabel = document.getElementById("xp-label");
        var xpBar = document.getElementById("xp-bar");

        // Update the XP label's value
        xpLabel.innerHTML = "LVL " + (level + 1);

        // Flash
        xpLabel.classList.add("flash-fast");
        setTimeout(function() {
            xpLabel.classList.remove("flash-fast");
        }, 500);

        // Calculate the progress to the next level
        var nextLevel = (level + 1 < XP_LEVELS.length) ? XP_LEVELS[level + 1] : XP_CAP;

        // Apply the progress to the progress bar
        xpBar.style.width = (((xp - XP_LEVELS[level]) / (nextLevel - XP_LEVELS[level])) * 100) + "%";

        // Populate the store and skill tree widgets
        populateStore();
        populateSkillTree();
    }

    // Returns all UI elements rendered by this UI manager
    getAllUIElements() {
        return [];
    }
}
