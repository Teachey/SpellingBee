var s;

var scl;
var gameWidth;
var gameHeight;
var screenWidth;
var screenHeight;
var cnv;

//letter positions
var possibleLetterPositions = [];
var letterPositions = [];
var eatenLetterPositions = [];

//tracking letters
var uneatenLetters = [];
var eatenLetters = [];
var eatenLettersInWord = [];
var currentString = ""; //TODO: this could be local to function
var prevNumLettersEaten = 0;
var wordsEaten = [];
var justEaten;

//letters
var vowels = ["a", "e", "i", "o", "u"];
var highFreqLetters = ["d", "g", "l", "n", "r", "s", "t"];
var medFreqLetters = ["b", "c", "f", "h", "m", "p", "v", "y"];
var lowFreqLetters = ["z", "x", "q", "j", "k"];
var NUM_CONSONANTS = 2;
var NUM_VOWELS = 2;

//dictionary variables
var dictionary = {};
var dictArr;

//score variables
var letterScoresDatabase;
var letterHash = {};
var score = 0;
var addToScore = 0;

// target words -- ateachey3
var display1 = "";
var spelledTarget = 0;
var index3;
var index4;
var index5;
var index6;
var index7;
var index8;
var index9;
var indexStop;

//fonts - Duri added, does not require server
//var bonusFont; maybe it does-- ateachey3
let bonusTextColor;
var count = 0;
var fade = 0;
var fadeAmount = 1;
var goingUp = true;
var bonusText;
var bonusTextLocation;
var bonusFading = false;

function preload() {
    //load font - Duri added, does not require server
    //maybe textFont does require server-- ateachey3
    //bonusFont = textFont('Arial');
    /**
    Uncaught TypeError: Cannot read property '_setProperty' of undefined
    at h.p.textFont (p5.min.js:3)
    at preload (sketch.js:537)
    **/
    dictArr = dict.split('\n').sort(function(a,b) {
        return a.length - b.length;
    });
    for (var i = 1; i < dictArr.length; i++) {
        if (dictArr[i].length > dictArr[i - 1].length) {
            if (dictArr[i].length == 3) {
                index3 = i;
            }
            else if (dictArr[i].length == 4) {
                index4 = i;
            }
            else if (dictArr[i].length == 5) {
                index5 = i;
            }
            else if (dictArr[i].length == 6) {
                index6 = i;
            }
            else if (dictArr[i].length == 7) {
                index7 = i;
            }
            else if (dictArr[i].length == 8) {
                index8 = i;
            }
            else if (dictArr[i].length == 9) {
                index9 = i;
            }
            else if (dictArr[i].length == 10) {
                indexStop = i;
            }
        }
      dictionary[dictArr[i]] = dictArr[i];
    }
    display1 = random(dictArr.slice(index3, index4));
    letterScoresDatabase = letters;
    for (let [key, value] of Object.entries(letterScoresDatabase)) {
      letterHash[value.letter] = parseInt(value.points);
    }
}

function setup() {
    gameWidth = min(windowWidth, windowHeight, 750);
    gameHeight = gameWidth;
    screenWidth = gameWidth;
    screenHeight = max(windowWidth, windowHeight, 950);
    scl = gameWidth / 15;
    cnv = createCanvas(screenWidth, screenHeight);
    centerCanvas();
    s = new Snake();
    frameRate(8);
    populatePossibleLetterPos();
    initLetters();

    // prevents window from scrolling -- ateachey3
    window.addEventListener("keydown", function(e) {
        // arrow keys
        if([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);

    // set options to prevent default behaviors for swipe, pinch, etc
    var options = {
        preventDefaults: true
    };

    //https://editor.p5js.org/projects/HyEDRsPel
    // document.body registers gestures anywhere on the page
    var hammer = new Hammer(document.body, options);
    hammer.get('swipe').set({
        direction: Hammer.DIRECTION_ALL
    });
    hammer.on("swipe", swiped);
}

function centerCanvas() {
    var x = (windowWidth - width) / 2;
    cnv.position(x, 0);
}

function windowResized() {
    centerCanvas();
}

function populatePossibleLetterPos() {
  //create an array with all possible letter locations - do this so we can keep track of which ones have been taken.
  var cols = floor(gameWidth/scl);
  var rows = floor(gameHeight/scl);
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      possibleLetterPositions.push(createVector(i, j));
    }
  }
}

function pickLocation() {
    var posIndex = Math.floor(Math.random()*possibleLetterPositions.length);
    var letterPos = possibleLetterPositions[posIndex];
    letterPos = letterPos.mult(scl);
    letterPositions.push(letterPos);
    possibleLetterPositions.splice(posIndex, 1);
}

function getAllSubstrings(str,size) {
  var i, j, result = [];
  size = (size || 0);
  for (i = 0; i < str.length; i++) {
      for (j = str.length; j-i>=size; j--) {
          result.push(str.slice(i, j));
      }
  }
  return result;
}

function clearThings() {
    score = 0;
    wordsEaten = [];
    eatenLetters = [];
    eatenLettersInWord = [];
    uneatenLetters = [];
    prevNumLettersEaten = 0;
    letterPositions = [];
    possibleLetterPositions = [];
    spelledTarget = 0;
    populatePossibleLetterPos();
}

function addLetter() {
  //this makes sure there are always the letters to spell the target word available on the screen
  if (display1.split('').includes(justEaten) && !uneatenLetters.includes(justEaten)) {
    var letter = justEaten;
    uneatenLetters.push(letter);
  } else { //Duri edited this else clause - does NOT require server
    //infrequently but randomly - put a $ or @ in place of a letter
    //TODO: make $ and @ more inuitive images instead of letters
    var randomNumber = Math.floor(Math.random()*15);
    if (randomNumber == 1) {
      uneatenLetters.push("@");
    } else if (randomNumber >= 2 && randomNumber < 5) {
      uneatenLetters.push("$");
    } else {
      //if the eaten letter isn't in the target word and a $ or @ isn't randomly added, replace it with a letter of its same type
      if (vowels.includes(justEaten)) {
          //replace vowel
          var letter = vowels[Math.floor(Math.random()*vowels.length)]
          uneatenLetters.push(letter);
          } else {
          //replace consonant
          var index = Math.floor(Math.random()*21); //num consonants in english language
          var letter;
          if (index >= 0 && index < 3) {
            letter = lowFreqLetters[Math.floor(Math.random()*lowFreqLetters.length)]
          } else if (index >= 3 && index < 7) {
            letter = medFreqLetters[Math.floor(Math.random()*medFreqLetters.length)]
          } else {
            letter = highFreqLetters[Math.floor(Math.random()*highFreqLetters.length)]
          }
          uneatenLetters.push(letter);
         }
    }
  }
  pickLocation();
}

function initLetters() {
    var display1Lets = display1.split('');
    for (var i = 0; i < display1Lets.length; i++) {
        uneatenLetters.push(display1Lets[i]);
        pickLocation();
    }
    for (var i = 0; i < NUM_CONSONANTS; i++) {
      var index = Math.floor(Math.random()*21); //num consonants in english language
      var letter;
      if (index >= 0 && index < 3) {
        letter = lowFreqLetters[Math.floor(Math.random()*lowFreqLetters.length)]
      } else if (index >= 3 && index < 7) {
        letter = medFreqLetters[Math.floor(Math.random()*medFreqLetters.length)]
      } else {
        letter = highFreqLetters[Math.floor(Math.random()*highFreqLetters.length)]
      }
      uneatenLetters.push(letter);
      pickLocation();
    }
    for (var i = 0; i < NUM_VOWELS; i++) {
      var letter = vowels[Math.floor(Math.random()*vowels.length)]
      uneatenLetters.push(letter);
      pickLocation();
    }
}

// ateachey3
function swiped(event) {
    if (event.direction == 4) {
        s.dir(1, 0); //right
    } else if (event.direction == 8) {
        s.dir(0, -1); //up
    } else if (event.direction == 16) {
        s.dir(0, 1); //down
    } else if (event.direction == 2) {
        s.dir(-1, 0); //left
    }
    // Didn't prevent default swipe behavior
    //return false;
}

function draw() {
  clear();
  fill(51);
  background(220, 220, 220);
  rect(0, 0, gameWidth, gameHeight);
  for (var i = 0; i < letterPositions.length; i++) {
    if (s.eat(letterPositions[i])) {
      letterPositions.splice(i, 1);
      if (uneatenLetters[i] == "$" || uneatenLetters[i] == "@") {
        //don't add $ or @ to the tail
        s.total--;
        s.eaten.splice(s.eaten.length-1, 1); //Duri edited this line - does NOT require server
        //make a string from the eaten letters
        currentString = "";
        for (var j = 0; j < eatenLetters.length; j++) {
            currentString += eatenLetters[j];
        }
        //look for words in the string and record their locations
        var lettersToRemove = []; //TODO: might be able to replace this with eatenLettersInWord
        for (var j = 0; j < wordsEaten.length; j++) {
          var index = currentString.indexOf(wordsEaten[j]);
          if (index != -1) {
            var end = index + wordsEaten[j].length;
            for (var k = index; k < end; k++) {
              if (!lettersToRemove.includes(k)) {
                lettersToRemove.push(k);
              }
            }
          }
        }
        //sort values in letterstoRemove - have to go in reverse order so we don't mess up the indices as we go
        lettersToRemove.sort(function(a,b){ return b - a; });
        if (uneatenLetters[i] == "$") {
          //actually remove the letters we identified
          for (var j = 0; j < lettersToRemove.length; j++) {
            s.eaten.splice(lettersToRemove[j], 1);
            s.tail.splice(lettersToRemove[j], 1); //Duri added this line - does NOT require server
            eatenLetters.splice(lettersToRemove[j], 1);
            s.total--;
          }
        } else if (uneatenLetters[i] == "@") {
          var nonWordLettersToRemove = [];
          for (var j = 0; j < eatenLetters.length; j++) {
            if (!lettersToRemove.includes(j)) {
              nonWordLettersToRemove.push(j);
            }
          }
          nonWordLettersToRemove.sort(function(a,b){ return b - a; });
          for (var j = 0; j < nonWordLettersToRemove.length; j++) {
            s.eaten.splice(nonWordLettersToRemove[j], 1);
            s.tail.splice(nonWordLettersToRemove[j], 1); //Duri added - does NOT require server
            eatenLetters.splice(nonWordLettersToRemove[j], 1);
            s.total--;
          }
        }
      } else {
        eatenLetters.push(uneatenLetters[i]);
      }
      uneatenLetters.splice(i, 1);

      //check for words longer than 3 letters
      currentString = "";
      for (var i = 0; i < eatenLetters.length; i++) {
        currentString += eatenLetters[i];
      }
      if (currentString.length > 2) {
        var substrings = getAllSubstrings(currentString,3);
        for (var i = 0; i < substrings.length; i++) {
          if (!wordsEaten.includes(substrings[i])) {
            var wordFound = findWord(substrings[i].split(''));
            if (wordFound) { //Duri edited text in this if clause
              bonusFading = true;
              bonusText = "+" + addToScore;
              bonusTextLocation = createVector(s.x, s.y);
            }
          }
        }
        if (substrings.includes(display1)) {
            bonusFading = true;
            bonusText = "Aewsome!"; //TODO: replace this text with passed level text
            bonusTextLocation = createVector(gameWidth/2, gameHeight/2);
            console.log("Bonus Life!!!");
            spelledTarget++;
            // target word changes when player spells it correctly-- ateachey3
            if (display1.length == 3) {
                display1 = random(dictArr.slice(index4, index5));
            }
            else if (display1.length == 4) {
                display1 = random(dictArr.slice(index5, index6));
            }
            else if (display1.length == 5) {
                display1 = random(dictArr.slice(index6, index7));
            }
            else if (display1.length == 6) {
                display1 = random(dictArr.slice(index7, index8));
            }
            else if (display1.length == 7) {
                display1 = random(dictArr.slice(index8, index9));
            }
            else if (display1.length == 8) {
                display1 = random(dictArr.slice(index9, indexStop));
            }
            else if (display1.length == 9) {
                display1 = random(dictArr.slice(index3, index4));
            }
            //Duplicate code-- ateachey3
            var display1Lets = display1.split('');
            for (var i = 0; i < display1Lets.length; i++) {
                uneatenLetters.push(display1Lets[i]);
                pickLocation();
            }
        }
        prevNumLettersEaten = eatenLetters.length;
      }

      justEaten = eatenLetters[eatenLetters.length-1];
      addLetter();


      //look for words in the string and record their locations
      eatenLettersInWord = [];
      for (var j = 0; j < wordsEaten.length; j++) {
        var index = currentString.indexOf(wordsEaten[j]);
        if (index != -1) {
          var end = index + wordsEaten[j].length;
          for (var k = index; k < end; k++) {
            if (!eatenLettersInWord.includes(k)) {
              eatenLettersInWord.push(k);
            }
          }
        }
      }
    }
  }

  if(s.death()) {
    if (spelledTarget < 1) {
        clearThings();
        initLetters();
    }
    else { //target word only changes when bonus life is used-- ateachey3
        spelledTarget--;
        eatenLetters = [];
        /**
        if (display1.length == 3) {
            display1 = random(dictArr.slice(index4, index5));
        }
        else if (display1.length == 4) {
            display1 = random(dictArr.slice(index5, index6));
        }
        else if (display1.length == 5) {
            display1 = random(dictArr.slice(index6, index7));
        }
        else if (display1.length == 6) {
            display1 = random(dictArr.slice(index7, index8));
        }
        else if (display1.length == 7) {
            display1 = random(dictArr.slice(index8, index9));
        }
        else if (display1.length == 8) {
            display1 = random(dictArr.slice(index9, indexStop));
        }
        else if (display1.length == 9) {
            display1 = random(dictArr.slice(index3, index4));
        }
        **/
    }
  }

  fill(255, 0, 100);
  //draw the uneaten letters
  for (var i = 0; i < letterPositions.length; i++) {
    textAlign(CENTER);
    textSize(scl);
    if (uneatenLetters[i] == "$" || uneatenLetters[i] == "@") {
        fill(213, 48, 50);
    } else {
      fill(255, 255, 255);
    }
    text(uneatenLetters[i], letterPositions[i].x, letterPositions[i].y, scl, scl);
  }
    // the target words will go inside this box-- ateachey3
    fill(213, 48, 50);
    rect(0, gameHeight, gameWidth, scl * 2);

    fill(255);
    text(display1, gameWidth/2, gameHeight + scl * 1.5);

    fill(213, 48, 50);
    var str = "score:" + score;
    text(str, scl * 1.5, gameHeight + scl * 2.5, scl, scl);
    /**
    Maybe add "Tap here to continue in this space"-- ateachey3
    //draw words eaten
    if (wordsEaten) {
        for (var i = 0; i < wordsEaten.length; i++) {
            text(wordsEaten[i], 75, gameHeight + 130 + (i+1)*30, scl, scl);
        }
    }
    **/
    s.update();
    s.show();
    // if (bonusFading) { //Duri added this - does not require server
    //     bonusTextDisplay();//maybe it does-- ateachey3
    // }
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    s.dir(0, -1);
  } else if (keyCode === DOWN_ARROW) {
    s.dir(0, 1);
  } else if (keyCode === RIGHT_ARROW) {
    s.dir(1, 0);
  } else if (keyCode === LEFT_ARROW) {
    s.dir(-1, 0);
  }
}

//source code that is the basis of findWord function: https://johnresig.com/blog/dictionary-lookups-in-javascript/

// Takes in an array of letters and finds the longest
// possible word at the front of the letters
function findWord(letters) {
    // Clone the array for manipulation
    var currentLetters = letters.slice( 0 ), word = "";
    // Make sure the word is at least 3 letters long
    while (currentLetters.length > 2 ) {
        // Get a word out of the existing letters
        word = currentLetters.join("");
        // And see if it's in the dictionary
        if (dictionary[word]) {
          if(!wordsEaten.includes(word)) {
          wordsEaten.push(word);
          for (var j = 0; j < word.length; j++) {
              score = score + letterHash[word[j].toUpperCase()];
            }
            return word;
          }
        }
        // Otherwise remove another letter from the end
        currentLetters.pop();
    }
}

/**
//Duri added this method - does not require server
// maybe it does-- ateachey3
function bonusTextDisplay() {
  bonusTextColor.setAlpha(fade);
  fill(bonusTextColor)
  textFont(bonusFont);
  textSize(scl);
  text(bonusText, bonusTextLocation.x, bonusTextLocation.y, 40, 40);
  if (goingUp) {
    if (fade < 255) {
      fade = fade + 30;
    } else {
      goingUp = false;
    }
  } else {
    if (fade > 0) {
      fade = fade - 30;
    } else {
      goingUp = true;
      bonusText = "";
      bonusTextLocation = null;
      bonusFading = false;
    }
  }
  textFont('Arial');
}
**/
