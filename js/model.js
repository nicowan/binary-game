/**
 * This is a serious game which drills the conversion between binary
 * and base 8 (octal), base 10 (decimal) and base 16 (hexadecimal) numbers.
 * 
 * The game play is loosely based on tetris. Conversions challenges are
 * appearing and the player has to solve them to make them disappear. When
 * the playground is full, the game is finished.
 */

class GameModel {
   /**
    * Class constructor
    * @param {GameView} theView Reference to the GameView object
    */
   constructor(theView) {
      let self = this;

      /** Reference to the view */
      this.view = theView;

      /** Is the game playing or not ? */
      this.playing = false;

      /** The game level defines the frequency of new challenges creation */
      this.level = 1;

      /** The game score */
      this.score = 0;

      /** Counts how much conversion were resolved */
      this.countResolved = 0;

      /** Counts how much conversion are currently displayed */
      this.countOnScreen = 0;

      /** Counts how much conversion were generated */
      this.countGenerated = 0;

      /** List of challenges that are not resolved */
      this.convs = {};

      /** Remaining time before the creation of a new challenge */
      this.waitTime = 0;

      /** Counter to assign a unique ID for each challenge */
      this.convId = 0;

      /** Interval between two refresh in [ms] */
      this.delayMS = 100;

      /** Timer that is used to update the game */
      this.timer = setInterval(function() { self.gameRefresh() }, this.delayMS);
   }

   /**
    * Start a new game
    */
   startGame() {
      this.playing = true;
      this.level = 1;
      this.score = 0;
      this.countResolved  = 0;
      this.countOnScreen = 0;
      this.countGenerated = 0;
      this.convs = {};
      this.waitTime = 0;
      this.convId = 0;
      this.view.startGame();
   }

   /**
    * Insert new conversion after idle time is finished
    */
   gameRefresh() {
      if (this.playing && this.waitTime-- <= 0) {
         // reset counter to next challenge creation
         this.waitTime = config.LEVELS[this.level].delay * 1000 / this.delayMS ;
         this.waitTime += this.waitTime * (Math.random() * 0.25 - 0.125);

         // Count the next conversion
         this.countOnScreen += 1;
         this.countGenerated += 1;

         // Check for game over
         if (this.countOnScreen >= config.MAX_CONVERSION) {
            this.playing = false;
            this.view.gameOver();
         }
         else {
            // Create a new conversion and add it to the associative array
            let conv = new ModelConversion(this.convId++);
            this.convs[conv.id] = conv;

            // Add the conversion to the view
            this.view.addConversion(
               conv.id,
               conv.binaryFixed ? conv.binary : "0".repeat(config.BINRAY_LEN),
               conv.binaryFixed ? ""          : conv.numeric,
               conv.base,
               conv.binaryFixed
            );
         }
      }
   }

   /**
    * Delete a conversion after it was resolved
    * @param {number} id  Id of the conversion
    */
   deleteConversion(id) {
      delete this.convs[id];
      this.countResolved += 1;
      this.countOnScreen -= 1;
      this.score += config.LEVELS[this.level].point;
      if (this.countResolved >= config.LEVELS[this.level].maxLine) {
         this.level += 1;
         if (config.LEVELS[this.level] == undefined) {
            alert("Cheater! It is not possible to convert that way!!!");
            throw "All levels are completed";
         }
      }
   }

   /**
    * Checks a conversion against the real value
    * @param   {number} id  Id of the conversion
    * @param   {string} val The binary value to be checked
    * @returns {boolean} true when conversion is correct otherwise false
    */
   checkBinaryValue(id, val) {
      if((this.convs[id] !== undefined) && !this.convs[id].binaryFixed) {
         if(val.trim() == this.convs[id].binary) {
            this.deleteConversion(id);
            return true;
         }
      }
      return false;
   }

   /**
    * Checks a conversion against the real value
    * @param   {number} id  Id of the conversion
    * @param   {string} val The numeric value to be checked
    * @returns {boolean} true when conversion is correct otherwise false
    */
   checkNumericValue(id, val) {
      if((this.convs[id] !== undefined) && this.convs[id].binaryFixed) {
         if(val.trim() == this.convs[id].numeric) {
            this.deleteConversion(id);
            return true;
         }
      }
      return false;
   }
    
   /**
    * Get the given conversion
    */
   getConversion(id) {
      return this.convs[id];
   }
}

class ModelConversion {
   /**
    * Class constructor
    * @param {number} id The conversion identifier
    */
   constructor(id) {
      /** The conversion unique identifier */
      this.id = id || 0;

      /** integer value to be converted stored as a number */
      this.value = (Math.random() * ((1 << config.BINRAY_LEN) - 1)) | 0;

      /** base used by the number */
      this.base  = config.BASE_LIST[(Math.random() * config.BASE_LIST.length) | 0];

      /** Is the binary value fixed (when false, the user has to find out the binary value) */
      this.binaryFixed = Math.random() > 0.5;

      //this.base = 10; 
      //this.binaryFixed = true;
   }

   /**
    * The value has a binary string
    */
   get binary() {
      return this.convertToString(this.value, 2, config.BINRAY_LEN);
   }

   /**
    * The value as a numeric string in base
    */
   get numeric() {
      return this.convertToString(this.value, this.base);
   }    

   /**
    * Convert to number
    * @param   {string} strVal The value as a string 
    * @param   {number} base   The base used in the string
    * @returns {number} The strVal converted in a numerci value
    */
   convertToNumber(strVal, base) {
      let result = 0;
      let digits = "0123456789ABCDEF";

      for (let i=0; i<strVal.length; i++) {
         let digit = digits.indexOf(strVal[i]);
         result =  base * result + digit;
      }
      return result;        
   }

   /**
    * Convert to string
    * @param   {number} numVal The value as a number
    * @param   {number} base   The base used in the string
    * @param   {number} length The minimum length of the output string
    * @returns {string} The numVal converted in a string value
    */
   convertToString(numVal, base, length) {
      let result = "";
      let digits = "0123456789ABCDEF";

      // Length parameter is optional, when undefined output is not padded
      length = length || 0;

      do {
         // Convert remainder in a displayable digit
         result = digits[numVal % base] + result;

         // Get next number to divide -> ensure its an int
         numVal = (numVal / base) | 0;
      } while((--length > 0) || (numVal > 0));

      return result;
   }

   /**
    * @returns {string} A string representation of the object
    */
   toString() {
      return "ModelConversion[ " + this.id + "]" + 
             " value = " + this.value + 
             " binary = " + this.binary  +
             " numeric = " + this.numeric + "(" + this.base + ")" +
             " binrayFixed = " + (this.binaryFixed ? 'true' : 'false');
            
   }
}
