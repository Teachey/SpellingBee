var s; // this is the snake
var scl; // this is the letter size
var gameWidth; // this is the width of the area where the snake can move
var gameHeight; // this is the height of the area where the snake can move
var screenWidth; // this is the width of the window (max 750)
var screenHeight; // this is the height of the window (max 1000)
var cnv; // this is the entire canvas

//letter positions
var possibleLetterPositions = [];
var letterPositions = [];
var eatenLetterPositions = [];

//tracking letters
var uneatenLetters = [];
var eatenLetters = [];
var eatenLettersInWord = [];
var currentString = "";
var prevNumLettersEaten = 0;
var wordsEaten = [];
var justEaten;

//letters
var vowels = ["a", "e", "i", "o", "u"];
var highFreqLetters = ["d", "g", "l", "n", "r", "s", "t"];
var medFreqLetters = ["b", "c", "f", "h", "m", "p", "v", "y"];
var lowFreqLetters = ["z", "x", "q", "j", "k"];
var NUM_CONSONANTS = 4;
var NUM_VOWELS = 2;

//dictionary variables
var dictionary = {};
var dictArr;

//score variables
var letterScoresDatabase;
var letterHash = {};
var score = 0;
var addToScore = 0;

// target words
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

// true when the player has just completed a round
var betweenLevels;
var level = 0;

//art
var beeHeadRight, beeHeadDown, beeHeadUp, beeHeadLeft, easyFlower, medFlower, hardFlower, honeycomb, grass, bigGrass;

//sound
var textToSpeech;

//fonts 
var bonusTextColor;
var count = 0;
var fade = 0;
var fadeAmount = 1;
var goingUp = true;
var bonusText;
var bonusTextLocation;
var bonusFading = false;
var bonusFont;

var firstTime = false; 
var startOfGame = true;

function preload() {
    grass = loadImage('grass.png');
    bigGrass = loadImage('bigGrass.png');
    beeHeadUp = loadImage('beeHeadRoundUp.png');
    beeHeadDown = loadImage('beeHeadRoundDown.png');
    beeHeadLeft = loadImage('beeHeadRound.png');
    beeHeadRight = loadImage('beeHeadRoundRight.png');
    easyFlower = loadImage('tulip.png');
    medFlower = loadImage('fourPetalFlower.png');
    hardFlower = loadImage('manyPetalFlower.png');
    honeycomb = loadImage('honeycomb.png');
    //bonusFont = 'Helvetica';
    bonusFont = loadFont('Baloo-Regular.ttf');

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
    scl = gameWidth / 10;
    gameHeight = scl * ceil(windowHeight/scl) - scl * 3;
    screenWidth = gameWidth;
    screenHeight = windowHeight;
    betweenLevels = false;
    cnv = createCanvas(screenWidth, screenHeight);
    centerCanvas();
    bonusTextColor = color(255, 255 , 255);
    s = new Snake();
    frameRate(5);
    populatePossibleLetterPos();
    initLetters();
    textToSpeech = new p5.Speech(); // speech synthesis object

    // prevents window from scrolling on desktop
    window.addEventListener("keydown", function(e) {
        // arrow keys
        if([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);

    //https://editor.p5js.org/projects/HyEDRsPel
    // document.body registers gestures anywhere on the page
    var hammer = new Hammer(document.body);
    hammer.get('swipe').set({
        direction: Hammer.DIRECTION_ALL
    });
    hammer.on("swipe", swiped);

    document.body.addEventListener("touchmove", function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // https://stackoverflow.com/questions/10951524/play-and-replay-a-sound-on-safari-mobile
    // Makes sounds work on iPhone, but it starts kind of clunky on desktop
    var self = this;
    var letterGrab = new Audio('letterGrab.wav');
    var wall = new Audio('wall.wav');
    var wordBank = new Audio('wordBank.wav');
    var bonus = new Audio('bonus.wav');

    self.letterGrab = letterGrab;
    self.wall = wall;
    self.wordBank = wordBank;
    self.bonus = bonus;

    var startLetterGrab = function(){
        self.letterGrab.play();
        document.removeEventListener("touchstart", self.startLetterGrab, false);
    }
    self.startLetterGrab = startLetterGrab;
    var startWall = function(){
      self.wall.play();
      document.removeEventListener("touchstart", self.startWall, false);
    }
    self.startWall = startWall;
    var startWordBank = function(){
      self.wordBank.play();
      document.removeEventListener("touchstart", self.startWordBank, false);
    }
    self.startWordBank = startWordBank;
    var startBonus = function(){
      self.bonus.play();
      document.removeEventListener("touchstart", self.startBonus, false);
    }
    self.startBonus = startBonus;

    var pauseLetterGrab = function(){
        self.letterGrab.pause();
        self.letterGrab.removeEventListener("play", self.pauseLetterGrab, false);
    }
    self.pauseLetterGrab = pauseLetterGrab;
    var pauseWall = function(){
      self.wall.pause();
      self.wall.removeEventListener("play", self.pauseWall, false);
    }
    self.pauseWall = pauseWall;
    var pauseWordBank = function(){
      self.wordBank.pause();
      self.wordBank.removeEventListener("play", self.pauseWordBank, false);
    }
    self.pauseWordBank = pauseWordBank;
    var pauseBonus = function(){
      self.bonus.pause();
      self.bonus.removeEventListener("play", self.pauseBonus, false);
    }
    self.pauseBonus = pauseBonus;

    document.addEventListener("touchstart", self.startLetterGrab, false);
    self.letterGrab.addEventListener("play", self.pauseLetterGrab, false);
    document.addEventListener("touchstart", self.startWall, false);
    self.wall.addEventListener("play", self.pauseWall, false);
    document.addEventListener("touchstart", self.startWordBank, false);
    self.wordBank.addEventListener("play", self.pauseWordBank, false);
    document.addEventListener("touchstart", self.startBonus, false);
    self.bonus.addEventListener("play", self.pauseBonus, false);
}

function centerCanvas() {
    var x = (windowWidth - width) / 2;
    cnv.position(x, 0); //TODO: this line throws an error on iphone
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

function clearLettersOnly() {
  uneatenLetters = [];
  letterPositions = [];
    possibleLetterPositions = [];
        populatePossibleLetterPos();

}

function clearThings() {
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
  } else { 
    //infrequently but randomly - put a word bank in place of a letter
    var randomNumber = Math.floor(Math.random()*15);
    if (randomNumber > 0 && randomNumber < 4) {
      uneatenLetters.push("$");
    } else {
      //if the eaten letter isn't in the target word and a wordbank isn't randomly added, replace it with a letter of its same type
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
      // duplicate code
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

function touchEnded() {
    if (betweenLevels) {
      betweenLevels = false;
    }
}

// enables touch screen
function swiped(event) {
  if (startOfGame) {
      startOfGame = false;
  }
    if (!betweenLevels) {
        if (event.direction == 4) {
            s.dir(1, 0); //right
        } else if (event.direction == 8) {
            s.dir(0, -1); //up
        } else if (event.direction == 16) {
            s.dir(0, 1); //down
        } else if (event.direction == 2) {
            s.dir(-1, 0); //left
        }
    } else {
        if (event.direction) {
            betweenLevels = false;
        }
    }
}

function keyPressed() {
  if (startOfGame) {
    startOfGame = false;
  }
    if (!betweenLevels) {
        if (keyCode === UP_ARROW) {
            s.dir(0, -1);
        } else if (keyCode === DOWN_ARROW) {
            s.dir(0, 1);
        } else if (keyCode === RIGHT_ARROW) {
            s.dir(1, 0);
        } else if (keyCode === LEFT_ARROW) {
            s.dir(-1, 0);
        }
    } else {
        if (keyCode == ENTER) {
            betweenLevels = false;
        }
    }
}

function drawArt() {
  noTint();      
  noStroke();
  background(0, 165, 81);
  fill(0, 165, 81);
  rect(0, 0, gameWidth, gameHeight);
  image(bigGrass, 0, screenHeight - scl*3, gameWidth, scl*4);
  for (var i = 0; i < gameWidth/scl; i++) {
    for (var j = 0; j < gameHeight/scl; j++) {
      if (i % 2 == 0) {
        if (j % 2 == 0) {
          image(grass, scl*i, scl*j, scl, scl);
        }
      }
    }
  }
  //draw target word
  if (!betweenLevels) {
    fill(255);
    text(display1.toUpperCase(), gameWidth/2, screenHeight - scl);
  } 

  //draw score
  var str = `Score: ${score}`;
  text(str, scl * 2.5, screenHeight - scl*0.5);
  if (bonusFading) {
    bonusTextDisplay();
  }
 fill(255, 0, 100);
  //draw the uneaten letters
  for (var i = 0; i < letterPositions.length; i++) {
    if (uneatenLetters[i] == "$") {
      image(honeycomb, letterPositions[i].x, letterPositions[i].y, scl, scl);
    } else if (highFreqLetters.includes(uneatenLetters[i]) || vowels.includes(uneatenLetters[i])) {
      image(easyFlower, letterPositions[i].x, letterPositions[i].y, scl, scl);
    } else if (medFreqLetters.includes(uneatenLetters[i])) {
      image(medFlower, letterPositions[i].x, letterPositions[i].y, scl, scl);
    } else {
      image(hardFlower, letterPositions[i].x, letterPositions[i].y, scl, scl);
    }

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(scl/2);
    if (uneatenLetters[i] !== "$") {
      text(uneatenLetters[i].toUpperCase(), letterPositions[i].x + 2.5, letterPositions[i].y, scl, scl);
    }
  }
}

function draw() {
  if (betweenLevels) {
    //only draw the rectangle once
    if (firstTime) {
      //refresh the letters on the board between levels so it doesn't get too crowded
      clearLettersOnly();
      initLetters();
      drawArt();
      s.update();
      s.show();
      //draw tinted rectangle over screen
      fill(0, 0, 0, 100);
      rect(0, 0, screenWidth, screenHeight);
      firstTime = false;
    }
    //between level text
    textFont(bonusFont);
    var nextLevel = `Level ${level} complete\nwith ${score} points!\nTap to continue`;
    fill(255, 255, 255);
    textSize(scl);
    text(nextLevel, gameWidth/2, gameHeight/2);
    textFont('Arial');
  } else {
    for (var i = 0; i < letterPositions.length; i++) {
      if (s.eat(letterPositions[i])) {
        letterPositions.splice(i, 1);
        if (uneatenLetters[i] == "$") {
          //don't add $ to the tail
          s.total--;
          s.eaten.splice(s.eaten.length-1, 1); 
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
          wordBank.play();
          //actually remove the letters we identified
          for (var j = 0; j < lettersToRemove.length; j++) {
            s.eaten.splice(lettersToRemove[j], 1);
            s.tail.splice(lettersToRemove[j], 1); 
            eatenLetters.splice(lettersToRemove[j], 1);
            s.total--;
          }
        } else {
          letterGrab.play();
          eatenLetters.push(uneatenLetters[i]);
        }
        uneatenLetters.splice(i, 1);

        //check for words longer than 3 letters
        currentString = "";
        for (var i = 0; i < eatenLetters.length; i++) {
          currentString += eatenLetters[i];
        }
        if (currentString.length > 2) {
          var substrings = getAllSubstrings(currentString, 3);
          for (var i = 0; i < substrings.length; i++) {
            if (!wordsEaten.includes(substrings[i])) {
              var wordFound = findWord(substrings[i].split(''));
              if (wordFound) { 
                bonus.play(); 
                bonusFading = true;
                bonusText = "+" + addToScore;
                bonusTextLocation = createVector(s.x, s.y);
              }
            }
          }
          if (substrings.includes(display1)) {
            level++;
            bonusTextLocation = createVector(gameWidth/2, gameHeight/2);
            betweenLevels = true;
            firstTime = true;
            spelledTarget++;
            // target word changes when player spells it correctly
            if (display1.length == 3) {
                display1 = random(dictArr.slice(index4, index5));
            }
            else if (display1.length == 4) {
                display1 = random(dictArr.slice(index5, index6));
            }
            else if (display1.length == 5) {
                display1 = random(dictArr.slice(index6, index7));
                //reduce number of additional letters being displayed
                NUM_CONSONANTS = 2;
                NUM_VOWELS = 2;
            }
            else if (display1.length == 6) {
                display1 = random(dictArr.slice(index7, index8));
            }
            else if (display1.length == 7) {
                display1 = random(dictArr.slice(index8, index9));
            }
            else if (display1.length == 8) {
                display1 = random(dictArr.slice(index9, indexStop));
                //reduce number of additional letters being displayed
                NUM_CONSONANTS = 1;
                NUM_VOWELS = 1;
            }
            else if (display1.length == 9) {
                display1 = random(dictArr.slice(index3, index4));
            }
            //duplicate code
            var display1Lets = display1.split('');
            for (var i = 0; i < display1Lets.length; i++) {
                uneatenLetters.push(display1Lets[i]);
                pickLocation();
            }
          }
          prevNumLettersEaten = eatenLetters.length;
        }

        justEaten = eatenLetters[eatenLetters.length - 1];
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

    drawArt();
    s.update();
    s.show();

    if(s.death()) {
      if (spelledTarget < 1) {
        clearThings();
        initLetters();
      }
      else {
        spelledTarget--;
        eatenLetters = [];
      }
    }
  }
  if (startOfGame) {
    //TODO: In a future version, this tutorial would also show the point values of the flowers and let the user practice swiping
    fill(0, 0, 0, 100);
    rect(0, 0, screenWidth, screenHeight);
    textFont(bonusFont);
    var startText = "1. Swipe to move bee. \n 2. Collect words for points. \n 3. Complete target word to level up. \n 4. Avoid walls and body.";
    fill(255, 255, 255);
    textSize(scl/2);
    text(startText, gameWidth/2, gameHeight/2);
    textFont('Arial');
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
            textToSpeech.speak(word); //speech to text reads the word
            wordsEaten.push(word);
            addToScore = 0;
            for (var j = 0; j < word.length; j++) {
                if (lowFreqLetters.includes(word[j])) {
                  addToScore += 3;
                } else if (medFreqLetters.includes(word[j])) {
                  addToScore += 4;
                } else {
                  addToScore += 11;
                }
                score += addToScore;
            }
            return word;
          }
        }
        // Otherwise remove another letter from the end
        currentLetters.pop();
    }
}

function bonusTextDisplay() {
  bonusTextColor.setAlpha(fade);
  fill(bonusTextColor)
  textSize(60); //TODO: make proportional to scl
  textFont(bonusFont);
  text(bonusText, bonusTextLocation.x, bonusTextLocation.y, scl, scl);
  bonusTextLocation.y = bonusTextLocation.y - 20;
  if (goingUp) {
    if (fade < 255) {
      fade = fade + 100;
    } else {
      goingUp = false;
    }
  } else {
    if (fade > 0) {
      fade = fade - 100;
    } else {
      goingUp = true;
      bonusText = "";
      bonusTextLocation = null;
      bonusFading = false;
    }
  }
  textFont('Helvetica');
}
