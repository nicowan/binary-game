/**
 * This is a serious game which drills the conversion between binary
 * and base 8 (octal), base 10 (decimal) and base 16 (hexadecimal) numbers.
 * 
 * The game play is loosely based on Tetris. Conversions challenges are
 * appearing and the player has to solve them to make them disappear. When
 * the playground is full, the game is finished.
 */

var gameView = null;

/**
 * Game entry point is launched when the page has been loaded
 * @param {Event} ev event description
 */
window.onload = function(ev) {
  gameView = new GameView("playArea");
};

/** configuration object */
let config = {
  /** How many bits in a binary value */
  BINRAY_LEN  : 8,

  /** The supported bases */
  BASE_LIST   : [8, 10, 16],

  /** How many lines are displayed */
  MAX_CONVERSION: 9,

  /** Level definitions */
  LEVELS: {
    1: {point:   1, delay: 15.0, maxLine:  10},
    2: {point:   2, delay: 10.0, maxLine:  20},
    3: {point:   4, delay:  8.0, maxLine:  50},
    4: {point:   8, delay:  6.0, maxLine:  80},
    5: {point:  16, delay:  5.0, maxLine: 100},
    6: {point:  32, delay:  4.0, maxLine: 120},
    7: {point:  64, delay:  3.0, maxLine: 140},
    8: {point: 128, delay:  2.0, maxLine: 200},
    9: {point: 128, delay:  1.0, maxLine: 900},
  },
}


/**
 * GameView class is responsible for the user interactions (display and input)
 */
class GameView {
  /**
   * GameView class constructor. Is responsible to create the model
   * @param {String} htmlContainerId HTML element's ID that contains the game
   */
  constructor(htmlContainerId) {
    let self  = this;

    /** The HTML element which contains the complete game display */
    this.container = document.getElementById(htmlContainerId);

    /** Reference to the game model */
    this.model = new GameModel(this);

    /** Array of the conversion view */
    this.convs = {};

    /** Reference on the input that has the focus */
    this.focus     = null;

    /** Reference on the focused conversion */
    this.focusConv = null;

    /** Button to start the game */
    this.btnStart = document.getElementById("btnStart");
    this.btnStart.addEventListener("click", function(e) { self.model.startGame(); });

    /** Button to return to title page */
    this.btnOver = document.getElementById("btnTitle");
    this.btnOver.addEventListener("click", function(e) { self.showTitle(); });

    /** Buttons to enter a digit in the current numerical input */
    this.btnDigit = document.getElementsByClassName("keyboard");

    /** Detect if a touchscreen or not */
    this.clickName = "click";
    if ("ontouchstart" in document.documentElement) {
      // On touchscreen use touch-start event they are faster than click
      this.clickName = "touchstart";
    }

    // Attach click events to digit button
    for(let i=0; i<this.btnDigit.length; i++) {
      this.btnDigit[i].addEventListener( this.clickName, function(e) {
        // Needed to use with touch-start event
        if (e.target.disabled) {
          e.preventDefault();
          return false;
        }

        if (self.btnDigit[i].value == "DEL") {
          self.focus.value = "";
        }
        else {
          self.focus.value += self.btnDigit[i].value;
          self.focusConv.onNumChange();
        }
      });
    }

    let game = document.getElementById("game");
    game.addEventListener("dblclick", function(e) {e.preventDefault()});

    this.showTitle();
    this.resize();
  }

  /**
   * Resize the canvas on window resize
   */
  resize() {
    let titleEl = document.getElementById("title");
    let gameEl  = document.getElementById("game");
    let overEl  = document.getElementById("over");

    var width  = gameEl.clientWidth;
    var height = gameEl.clientHeight;
    var scaleX = window.innerWidth / width;
    var scaleY = window.innerHeight / height;
    var fit    = Math.min(scaleX, scaleY);

    gameEl.style.transformOrigin = "0 0";
    gameEl.style.transform = "scale(" + fit +", " + fit+")";
    gameEl.style.left = Math.floor((window.innerWidth  - width*fit)  /2) + "px";
    gameEl.style.top  = Math.floor((window.innerHeight - height*fit) /2) + "px";

    titleEl.style.transformOrigin = "0 0";
    titleEl.style.transform = "scale(" + fit +", " + fit+")";
    titleEl.style.left = Math.floor((window.innerWidth  - width*fit)  /2) + "px";
    titleEl.style.top  = Math.floor((window.innerHeight - height*fit) /2) + "px";

    overEl.style.transformOrigin = "0 0";
    overEl.style.transform = "scale(" + fit +", " + fit+")";
    overEl.style.left = Math.floor((window.innerWidth  - width*fit)  /2) + "px";
    overEl.style.top  = Math.floor((window.innerHeight - height*fit) /2) + "px";
  };

  /**
   * Show some debug text useful when on a phone or tablet
   * @param {string} text Text to be shown in element with id = debug
   */
  debugPrint(text) {
    document.getElementById("debug").innerHTML = text;
  }

  /**
   * Force the view to switch to the game over page
   */
  gameOver() {
    // Update the content of the game over page
    document.getElementById("overScore").innerText = this.model.score;
    document.getElementById("overLevel").innerText = this.model.level;
    document.getElementById("overLine").innerText = this.model.countResolved;

    // Hide and show the pages
    this.display("title", false);
    this.display("game",  false);
    this.display("over",  true);
  }

  /**
   * Force the view to switch to the game view and clear current game
   */
  startGame() {
    this.convs = {};
    document.getElementById("playArea").innerHTML = "";

    this.display("title", false);
    this.display("game",  true);
    this.display("over",  false);
  }

  /**
   * Shows the title page and update it
   */
  showTitle() {
    this.display("title", true);
    this.display("game",  false);
    this.display("over",  false);
  }

  /**
   * 
   * @param {string}  id   Page to display
   * @param {boolean} show True to display otherwise hide it
   */
  display(id, show) {
    document.getElementById(id).style.display = show ? 'block' : 'none';
    this.resize();
    //document.getElementById(id).style.zIndex = show ? "1" : "-1";
  }

  /**
   * Set the focus on a conversion to use with the screen keyboard
   * @param {ViewConversion} conv The conversion that has the focus
   */
  setFocus(conv) {
    this.focus = conv.htmlNum;
    this.focusConv = conv;

    // Enable / Disable the virtual keyboard buttons
    for(let i=0; i<this.btnDigit.length; i++) {
      let value = this.btnDigit[i].value;
      let num   = parseInt(value, 16)

      this.btnDigit[i].disabled = !((value == "DEL") || (num < conv.base));
    }
  }

  /**
   * Create a ViewConversion object that reflects the model
   * @param {Number} id Conversion ID (same as in the model)
   * @param {String} binVal The binary value
   * @param {String} numVal The numeric value
   * @param {Number} base The base used for the numerc value
   * @param {boolean} binFixed Is the binary value fixed ?
   */
  addConversion(id, binVal, numVal, base, binFixed) {
    this.convs[id] = new ViewConversion(
      this,
      id,
      binVal,
      numVal,
      base,
      binFixed
    );
    this.updateGameStatus();
  }

  /**
   * 
   * @param {GameView} obj Reference to the GameView object, avoids use of self
   * @param {Number}   id  conversion ID
   */
  deleteAfterAnimation(obj, id) {
    // Append a remove animation class toe the conversion
    obj.convs[id].htmlView.className += " removeAnimation";
    // Callback when animation is finished
    obj.convs[id].htmlView.addEventListener("animationend", function(e) {
      // The animation is finished, remove the node from HTML
      obj.convs[id].htmlView.parentNode.removeChild(obj.convs[id].htmlView);
      // Remove the object from the view
      delete obj.convs[id];
      // Update the score
      obj.updateGameStatus();

      // Set the focus to the next conversion with fixed binary value
      for(let propertyName in obj.convs) {
        if (obj.convs[propertyName].binaryFixed) {
          obj.setFocus(obj.convs[propertyName]);
          break;
        }
      }
    });
  }

  /**
   * Update the on game display
   */
  updateGameStatus() {
    document.getElementById("gameScore").innerText = this.model.score;
    document.getElementById("gameLevel").innerText = this.model.level;
    document.getElementById("gameLine").innerText  = this.model.countResolved;
  }

  /**
   * Check if the entered binary value is correct
   * @param {Number}  id The Conversion ID
   * @param {String} val The value to be checked against the model
   */
  checkBinConversion(id, val) {
    if (this.model.checkBinaryValue(id, val)) {
      this.deleteAfterAnimation(this, id);
    }
  }

  /**
   * Check if the entered numeric value is correct
   * @param {Number}  id The Conversion ID
   * @param {String} val The value to be checked against the model
   */
  checkNumConversion(id, val) {
    if (this.model.checkNumericValue(id, val)) {
      this.deleteAfterAnimation(this, id);
    }
  }
}

class ViewConversion {
  constructor(view, id, binVal, numVal, base, binFixed) {
    /** Reference on the view */
    this.view = view;

    /** Conversion identifier (same as in the model) */
    this.id = id;

    /** The binary value shown in the GUI */
    this.binary = binVal;

    /** The numeric value shown in the GUI */
    this.numeric = numVal;

    /** The numeric value's base (used to filter the input) */
    this.base = base;

    /**
     * Is the binary value fixed ? When true the user has to discover the 
     * numeric value otherwise he has to search for the binary value
     * */
    this.binaryFixed = binFixed;

    /** Container element for the conversion view */
    this.htmlView = null;

    /** Array of buttons for the binary number input */
    this.htmlBin = [];

    /** The input element for the numeric value */
    this.htmlNum = null;

    this.createView();
  }

  /**
   * Callback when a bit is changed
   */
  onBinClick(event) {
    // Needed to use with touchstart event
    if (event.target.disabled) {
      event.preventDefault();
      return false;
    }

    // Toggle the button value 0 <-> 1
    event.target.value = (event.target.value == '1') ? '0' : '1';

    // Retrieve the full binary value
    let result = "";
    for(let i=0; i<this.htmlBin.length; i++) {
      result = result + this.htmlBin[i].value;
    }

    // Check with the model for correct value
    this.view.checkBinConversion(this.id, result);
  }

  /**
   * Callback when a key is pressed in numeric input
   */
  onNumKey(event) {
    // The purpose of this callback is to filter the keys to ensure
    // that all digit are valid in the input field
    let self   = this;
    let digits = "0123456789ABCDEF";
    let inp    = event.target;
    let key    = event.key.toUpperCase();
    let idx    = digits.indexOf(key);
    let ctrl   = (key == "DELETE") || (key == "BACKSPACE") || (key == "ARROWLEFT") || (key == "ARROWRIGHT");

    // Cancel the keypress if not valid
    if (((idx == -1) || (idx >= this.base)) && !ctrl) {
      event.preventDefault();
    }
    else {
      // Hack to force the value to upper case because it looks better
      // Use setTimeout to ensure the function is executed after the 
      // character has been added 
      setTimeout(function() {
        let start = inp.selectionStart;
        let end   = inp.selectionEnd;
        inp.value = inp.value.toUpperCase();
        inp.setSelectionRange(start, end);
        self.onNumChange();
      }, 0);   
    }
  }

  /**
   * Callback when a numeric input is clicked
   */
  onNumClick(event) {
    // Needed to use with touchstart event
    if (event.target.disabled) {
      event.preventDefault();
      return false;
    }

    // Save the element with the focus in the view to manage the screen keypad
    this.view.setFocus(this);
  }

  /**
   * "Callback" when the numeric value changes
   */
  onNumChange() {
    let result = this.htmlNum.value;

    // TODO: Find out a way to help the player 
    /* This was a try to mark in green correct bits and red the wrong one
    ** It brings more confusion
    let conv = this.view.model.getConversion(this.id);


    let numVal = conv.convertToNumber(result, this.base);
    let strVal = conv.convertToString(numVal, 2, config.BINRAY_LEN);
    console.log(strVal + "  " + conv.binary);

    // Update bit colors, in the hope it will help guessing the value
    for (let i = 0; i < config.BINRAY_LEN; i++) {
      this.htmlBin[i].className = "binaryInput " +
        ((strVal[i] == conv.binary[i]) ? "ok" : "ko");
    }
    */
    this.view.checkNumConversion(this.id, result);
  }

  /**
   * Create the view for this input
   */
  createView() {
    let self = this;

    // Create the binary container
    let divBinary = document.createElement("div");
    divBinary.className = "binaryPane";

    // Create the binary inputs 
    for(let i=0; i<config.BINRAY_LEN; i++) {
      let group = (i < 2 ? 'g1' : (i < 5 ? 'g2' : 'g3'));

      if (this.base == 8) {
        group = (i < 2 ? 'g1' : (i < 5 ? 'g2' : 'g3'))
      }
      else {
        group = (i < 4 ? 'g2' : 'g3');
      }

      this.htmlBin[i] = document.createElement("input");
      this.htmlBin[i].className = "binaryInput " + group;
      this.htmlBin[i].type      = "button";
      this.htmlBin[i].value     = this.binary[i];
      this.htmlBin[i].disabled  = this.binaryFixed;
      this.htmlBin[i].addEventListener(this.view.clickName, function(e){
        self.onBinClick(e);
      });
      divBinary.appendChild(this.htmlBin[i]);
    }

    // Create the digit container
    let divDigit = document.createElement("div");
    divDigit.className = "numberPane";

    // Create the base display
    let temp = document.createElement("p");
    temp.className = "equalSign";
    temp.innerText = "=";
    divDigit.appendChild(temp);


    // Create the number input
    this.htmlNum = document.createElement("input");
    this.htmlNum.className = "numberInput";
    this.htmlNum.type = this.view.clickName == "click" ? "text" : "button";
    this.htmlNum.value = this.numeric;
    this.htmlNum.disabled = !this.binaryFixed;
    this.htmlNum.addEventListener( this.view.clickName, function(e) {
      self.onNumClick(e);
    });
    this.htmlNum.onkeypress = function(e) { self.onNumKey(e);   }

    divDigit.appendChild(this.htmlNum);

    // Create the base display
    temp = document.createElement("p");
    temp.className = "baseVal";
    temp.innerText = this.base;
    divDigit.appendChild(temp);

    // Create the global element for the view
    this.htmlView = document.createElement("div"); 
    this.htmlView.className = "gameLine";
    this.htmlView.appendChild(divBinary);
    this.htmlView.appendChild(divDigit);

    // Append the line to the playArea
    document.getElementById("playArea").appendChild(this.htmlView);
  }
}
