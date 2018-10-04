/**
 * This is a small binary game base on the Binary tetris game from CISCO.
 *
 * @author  Nicolas Wanner
 * @version 0.1 2016-09-18
 */


/**
 * This is the class that manages one conversion binary <-> number
 */
class OneConversion {
    constructor(id, ctrl) {
        /** Conversion sequence number (id) */
        this.id    = id || 0;          // Conversion ID

        /** Keep a reference on the controller */
        this.ctrl  = ctrl || null;

        /** The value to find */
        this.targetValue  = 0;

        /** Input or display value in binary */
        this.binaryString = "";

        /** Input or display value in base 8, 10 or 16 */
        this.numberString = "";

        /** The base used for the numberString */
        this.numberBase   = 10;

        /** Is binary the fixed value ? */
        this.isBinaryFixed = true;

        /** List of supported bases for the numberString */
        this.baseList = [8, 10, 16];

        /** Length of binary numbers  */
        this.binaryLength = 8;

        /** The HTML reference of the game line view */
        this.htmlView = null;

        /** References to the HTML button for binary input */
        this.htmlBin = [];
        
        /** Reference to the HTML input for decimal, octal or hexa input */
        this.htmlNum = null;

        this.randomConversion();
        this.createView();
   }

    /**
    * Select a random number in 1 of the possible bases (2, 8, 10 or 16)
    */
    randomConversion() {
        // Select the value to find
        this.targetValue   = Math.round(255 * Math.random());

        // Select if the user has to find out the binary or the number value
        this.isBinaryFixed = (Math.random() < 0.5);

        // Choose the base for the number display
        this.numberBase    = this.baseList[Math.round(2 * Math.random())];

        if (this.isBinaryFixed) {
            // The binary is fixed -> the displayed value is binary, player must
            // find out the numberString in the requested base
            this.binaryString = this.convertToBase(this.targetValue, 2, this.binaryLength);
            this.numberString = "";
        }
        else {
            // The number is fixed -> the displayed value is number, player must
            // find out the binary representation
            this.binaryString = "00000000";
            this.numberString = this.convertToBase(this.targetValue, this.numberBase);
        }
    }

    /**
    * Create the view for this input
    */
    createView() {
        let self = this;

        // Create the binary container
        let binary = document.createElement("div");
        binary.className = "binary";

        // Create the binary inputs 
        for(let i=0; i<this.binaryLength; i++) {
            this.htmlBin[i] = document.createElement("input");
            this.htmlBin[i].className = "button";
            this.htmlBin[i].type      = "checkbox";
            this.htmlBin[i].checked   = this.binaryString[i] == '1';
            this.htmlBin[i].disabled  = this.isBinaryFixed;
            this.htmlBin[i].onchange  = function(event) {
                self.onBinaryChange(event);
            };
            binary.appendChild(this.htmlBin[i]);
        }

        // Create the digit container
        let digit = document.createElement("div");
        digit.className = "number";

        // Create the number input
        this.htmlNum = document.createElement("input");
        this.htmlNum.className = "decimal";
        this.htmlNum.type = "text";
        this.htmlNum.value = this.numberString;
        this.htmlNum.onclick = function(event) {
            console.log("clock");
        };
        digit.appendChild(this.htmlNum);

        // Create the base display
        let temp = document.createElement("p");
        temp.innerText = this.numberBase;
        digit.appendChild(temp);

        // Create the global element for the view
        this.htmlView = document.createElement("div"); 
        this.htmlView.className = "gameLine";
        this.htmlView.appendChild(binary);
        this.htmlView.appendChild(digit);

        // Append the line to the playArea
        document.getElementById("playArea").appendChild(this.htmlView);
    }

    /**
     * 
     * @param {HtmlEvent} event 
     */
    onBinaryChange(event) {
        let str = "";
        for(let i=0; i<this.binaryLength; i++) {
            str += (this.htmlBin[i].checked) ? '1' : '0';
        }
        console.log("valeur binaire " + str);
    }


    /**
    * Convert a number from given base to decimal
    * @param   {String} theNumber a number given in "theBase" base
    * @param   {Number} theBase   the base of the given number
    * @returns {Number} the decimal value
    */
    convertToDecimal(theNumber, theBase) {
        let result = 0;
        let digits = "0123456789ABCDEF";

        for (let i=0; i<theNumber.length; i++) {
            let digit = digits.indexOf(theNumber[i]);
            result =  theBase * result + digit;
        }
        return result;
    }

    /**
    * Convert a number in a theBase base string
    * @param   {Number} theNumber a numerical value
    * @param   {Number} theBase   the destination base
    * @param   {Number} minLength Output value length
    * @returns {String} The number represented in the given base
    */
    convertToBase(theNumber, theBase, minLength) {
        let result = "";
        let digits = "0123456789ABCDEF";

        do {
            // Convert remainder in a displayable digit
            result = digits[theNumber % theBase] + result;

            // Get next number to divide -> ensure its an int
            theNumber = (theNumber / theBase) | 0;
        } while((--minLength > 0) || (theNumber > 0));

        return result;
    }

}

let toto = new OneConversion();
let toti = new OneConversion();
let totu = new OneConversion();


// View for one conversion
var ConvertView = (function() {

   var obj = function(ctrl, id) {
      var self   = this;         // Current object

      // Callback when binary changed
      var bincb  = function(event) {
         self.binary_changed(event);
      };

      // Callback when decimal changed
      var deccb  = function(event) {
         self.decimal_changed(event);
      };

      // Object's attributes ---------------------------------------------------
      this.id    = id;          // Conversion ID
      this.ctrl  = ctrl;        // keep a reference on the controller
      this.row   = null;        // The table row      (jquery object)
      this.bin   = [];          // The binary  inputs (jquery objects)
      this.dec   = null;        // The decimal input  (jquery object)

      // Object's constructor --------------------------------------------------

      // Create the table row
      this.row = $("<tr>");

      // Create all binary inputs
      for(var i=0; i<this.ctrl.BIN_LEN; i++) {
         this.bin[i] = $('<input class="button" type="checkbox" value="1" />');
         this.bin[i][0].onchange = bincb;
         this.row.append($('<td class="bit">').append(this.bin[i]));
      }

      // Create the spacer (don't keep reference)
      this.row.append('<td class="equal">=</td>');

      // Create the decimal input
      this.dec = $('<input class="decimal" type="number">');
      // Must used array index [0] otherwise it does not work!!!
      this.dec[0].onchange = deccb;
      this.row.append($('<td>').append(this.dec));
   };

   /**
    * Set the binary view to the given value
    * @param  {string} binary Binary string to represent a value
    */
   obj.prototype.binary_set = function(binary) {
      for(var i=0; i<this.ctrl.BIN_LEN; i++) {
         this.bin[i][0].checked = (binary[i] === '1');
      }
   };

   /**
    * Get the binary value from the view
    * @return {string} Binary string to represent a value
    */
   obj.prototype.binary_get = function() {
      var str = "";
      for(var i=0; i<this.ctrl.BIN_LEN; i++) {
         str += (this.bin[i][0].checked) ? '1' : '0';
      }
      return str;
   };

   /**
    * Called when the binary value has changed in the view
    */
   obj.prototype.binary_changed = function(event) {
      console.log(this.binary_get());
      // Signal change to the controller
      this.ctrl.report_new_bin(this.id, this.binary_get());
   };

   /**
    * Set the decimal view to the given value
    * @param  {number} decimal Decimal value to be set in the input
    */
   obj.prototype.decimal_set = function(decimal) {
      this.dec[0].value = decimal;
   };

   /**
    * Get the decimal value from the view
    * @return {number} Decimal value from the input
    */
   obj.prototype.decimal_get = function(decimal) {
      return parseInt(this.dec[0].value);
   };

   /**
    * Called when the decimal value has changed in the view
    */
   obj.prototype.decimal_changed = function(event) {
      console.log(this.decimal_get());
      // Signal change to the controller
      this.ctrl.report_new_dec(this.id, this.decimal_get());
   };

   /**
    * Called when the view must be destroyed
    */
   obj.prototype.delete_view = function() {
      // Start the delete animation
      var self = this;

      this.row.addClass( 'remove' ).on( 'animationend', function() {
         // Replace the view with an empty line
         self.row.html('<th colspan="10"></th>');
         // Remove from controller / model
         console.log("Delete view " + self.id);
         self.ctrl.conv_del(self.id);
      });
   };


   return obj;
})();



//******************************************************************************
//******************************************************************************
//******************************************************************************

// Model for one conversion
var ConvertModel = (function() {

   /**
    * Class constructor
    * @return {[type]} [description]
    */
   var obj = function() {
      if (Math.random() > 0.5) {
         // Choose decimal number, binary should be edited
         this.edit   = "binary";
         this.decVal = Math.round(255 * Math.random());
         this.binVal = "00000000";
      }
      else {
         // Choose binary number, decimal should be edited
         this.edit   = "decimal";
         this.decVal = 0;
         this.binVal = this.to_bin(Math.round(255 * Math.random()));
      }
   };

   /**
    * Check if decimal and binary values are the same
    * @return {Boolean} [description]
    */
   obj.prototype.is_valid = function() {
      return this.decVal === this.to_dec(this.binVal);
   };

   /**
    * Set a new decimal value and check if result is OK
    */
   obj.prototype.set_dec = function(dec) {
      this.decVal = dec;
      return this.is_valid();
   };

   /**
    * Set a new binary value and check if result is OK
    */
   obj.prototype.set_bin = function(bin) {
      this.binVal = bin;
      return this.is_valid();
   };

   /**
    * Convert the binary string to a decimal value
    */
   obj.prototype.to_dec = function(binary) {
      var result = 0;
      for(var i=0; i<binary.length; i++) {
         result = result * 2 + ((binary[i]==='1') ? 1 : 0);
      }
      return result;
   };

   /**
    * Convert the decimal value in a binary string
    */
   obj.prototype.to_bin = function(decimal) {
      var result = "";

      for(var i=0; i<8; i++) {
         result  = result + (((decimal%2) === 1) ? "1" : "0");
         decimal = decimal >> 1;
      }

      return result;
   };

   return obj;
})();



//******************************************************************************
// Controlleur pour le jeu
var BinGame = (function(){
   var obj = function(parent) {
      var self = this;

      // CONSTANTS -------------------------------------------------------------
      this.MAX_LEN = 10;                  // How many lines in the table
      this.BIN_LEN = 8;                   // Length of binary words
      this.PERIOD  = 20;                 // Timer period
      this.LEVELS  = [
         {delay: 10000, points: 10},      // Definition for level 0
         {delay:  9000, points: 15},      // Definition for level 1
         {delay:  8000, points: 20},      // Definition for level 2
         {delay:  7000, points: 25},      // Definition for level 3
      ];

      // ATTRIBUTES ------------------------------------------------------------
      this.parent  = parent;              // HtmlElement to display the game
      this.over    = false;               // Is game over
      this.score   = 0;                   // Score
      this.level   = 0;                   // Level
      this.unique  = 0;                   // ID counter for lines
      this.array   = [];                  // Conversion (view and model)
      this.delay   = 10000;               // Delay between line add

      // CONSTRUCTOR CODE ------------------------------------------------------
      // create a timer to update the stuff
      setInterval(function(event) { self.timer(event); }, this.PERIOD);

      // Start a new game
      this.new_game();
   };

   // Refresh the game periodically
   obj.prototype.timer = function(event) {
      if (this.over) {
         alert("Partie perdue!");
         this.new_game();
      }
      else {
         this.delay -= this.PERIOD;
         if (this.delay <= 0) {
            this.delay = this.LEVELS[this.level].delay;
            this.conv_add();
            this.show();
         }
      }
   };

   // Initialize the object for a new game
   obj.prototype.new_game = function() {
      this.over    = false;
      this.score   = 0;
      this.level   = 0;
      this.array   = [];
      this.delay   = this.LEVELS[this.level].delay;
      // Add the first conversion
      this.conv_add();
      this.show();
   };

   // Add a new conversion to the game array
   obj.prototype.conv_add = function() {
      var id    = this.unique++,
          view  = new ConvertView(this, id),
          model = new ConvertModel(this, id);

      view.binary_set(model.binVal);
      view.decimal_set(model.decVal);

      // Game array full -> game over
      if (this.array.length >= this.MAX_LEN) {
         this.over = true;
         return;
      }

      // There is place in the game array -> add it on top
      this.array.push({id:id, model:model, view:view});

      // Refresh the view
      this.show();
   };

   // Return index of a conversion identified by its ID (-1 when not found)
   obj.prototype.conv_get = function(id) {
      for(var i=0; i<this.array.length; i++) {
         if ((this.array[i] !== null) && (this.array[i].id == id)) {
            return i;
         }
      }
      return -1;
   };

   // Remove a conversion from the game array identified by its ID
   obj.prototype.conv_del = function(id) {
      var idx = this.conv_get(id);
      if (idx != -1) {
         this.array.splice(idx, 1);
         // Add a new line if the array is empty
         if (this.array.length === 0) {
            this.conv_add();
         }
         else {
            this.show();
         }         
      }
   };

   // The binary view has changed -> ask to update the model
   obj.prototype.report_new_bin = function(id, val) {
      var idx, line;
      if ((idx=this.conv_get(id)) != -1) {
         line = this.array[idx];
         if (line.model.set_bin(val)) {
            // Conversion is correct -> delete the current line
            this.score += this.LEVELS[this.level].points;
            line.view.delete_view();
         }
      }
   };

   // The decimal view has changed -> ask to update the model
   obj.prototype.report_new_dec = function(id, val) {
      var idx, line;
      if ((idx=this.conv_get(id)) != -1) {
         line = this.array[idx];
         if (line.model.set_dec(val)) {
            // Conversion is correct -> delete the current line
            this.score += this.LEVELS[this.level].points;
            line.view.delete_view();
         }
      }
   };

   // Show the current game array
   obj.prototype.show = function() {
      // Get current input focus
      var active = $(":focus");

      // TODO: Display score in the HTML
      console.log(this.score + " / " + this.level);

      // Clear view
      $(this.parent).html("");

      // Create the global view
      for(var i=this.MAX_LEN-1; i>=0; i--) {
         if ((i >= this.array.length) || (this.array[i] === null)) {
            $(this.parent).append( '<tr><th colspan="10"></th></tr>');
         }
         else {
            $(this.parent).append(this.array[i].view.row);
         }
      }

      // Restore current input focus
      active.focus();
   };

   return obj;
})();






//******************************************************************************
// Global variables
var my_game;

//******************************************************************************
// Start when dom loaded
$(function() {
   my_game = new BinGame("#main");
});

