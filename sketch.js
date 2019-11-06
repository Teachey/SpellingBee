//Source for the original snake code:

// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/AaGK-fj-BAM

//-------------------------------------------

//TODO: if time - fix weird bug where parts of the tail sometimes show up other random places on the screen.

var s;
var scl = 40; //change this to change the size of the letters

var gameWidth = 720; //this is set by width of iPhone 7
var gameHeight = 720; //change this to change the height of the playing space
var screenWidth = 720; //width of iPhone 7
var screenHeight= 1334; //height of iPhone 7

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
var NUM_CONSONANTS = 2; //change this to change the number of consonants
var NUM_VOWELS = 2; //change this to change the number of vowels

//dictionary variables
var dictionary = {};
var dictArr;

//score variables
var letterScoresDatabase;
var letterHash = {};
var score = 0;

// easy ateachey3
var myOwn = ["and", "who", "what", "where", "why", "when", "new", "how", "new"];

// target words -- ateachey3
var display1 = "";
var spelledTarget = 0;
var up;
var left;
var right;
var down;

// time -- ateachey
//var seconds = frameRate/60;

function preload() {
    dictArr = dict.split('\n');
    for (var i = 0; i < dictArr.length; i++) {
      dictionary[dictArr[i]] = dictArr[i];
    }
    display1 = random(/*dictArr*/myOwn);
    letterScoresDatabase = letters;
    for (let [key, value] of Object.entries(letterScoresDatabase)) {
      letterHash[value.letter] = parseInt(value.points);
    }
    /**
  dictArr = loadStrings("assets/dict.txt", function(result) {
    for (var i = 0; i < dictArr.length; i++) {
      dictionary[dictArr[i]] = dictArr[i];
    }
    display1 = random(dictArr);
    //uncomment below line for testing - makes winning faster
    //display1 = random(myOwn);
  });
  letterScoresDatabase = loadJSON("assets/letters.json", function(result) {
    for (let [key, value] of Object.entries(letterScoresDatabase)) {
      letterHash[value.letter] = parseInt(value.points);
  }
  });
  **/
}

function setup() {
	//socket = io.connect('http://localhost:3000');
	createCanvas(screenWidth, screenHeight);
	s = new Snake();
	frameRate(10);
	populatePossibleLetterPos();
	initLetters();
	// prevents window from scrolling -- ateachey3
	window.addEventListener("keydown", function(e) {
		// arrow keys
		if([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
			e.preventDefault();
		}
	}, false);

    /*
    up = createButton('up');
    up.position(100, gameHeight + 200);
    up.mousePressed(s.dir(0, -1));
    left = createButton('left');
    left.position(40, gameHeight + 235);
    left.mousePressed(s.dir(-1, 0));
    right = createButton('right');
    right.position(160, gameHeight + 235);
    right.mousePressed(s.dir(1, 0));
    down = createButton('down');
    down.position(100, gameHeight + 260);
    down.mousePressed(s.dir(0, 1));
    */
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
    populatePossibleLetterPos();
    // ateachey3
    nextIndex = -1;
    ultimateIndex = -1;
    almostThere = -1;
}

function addLetter() {
  var randomNumber = Math.floor(Math.random()*15); //TODO: change to 15 for gameplay
  if (randomNumber == 1) {
    uneatenLetters.push("@");
  } else if (randomNumber >= 2 && randomNumber < 5) {
    uneatenLetters.push("$");
  } else {
	  if (display1.split('').includes(justEaten)) {
	  	//replace the letter exactly? is this too easy? Alternative - replace it with a random letter from the word
	  	var letter = justEaten;
	  	uneatenLetters.push(letter);
	  } else if (vowels.includes(justEaten)) {
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

// What was this for? -- ateachey3
// function mousePressed() {
//   s.total++;
// }

// enables touch screen --ateachey3
function mousePressed() {
    if (mouseIntersection(100, gameHeight + 200, 50, 50)) {
        s.dir(0, -1);
    }
    else if (mouseIntersection(100, gameHeight + 260, 50, 50)) {
        s.dir(0, 1);
    }

    else if (mouseIntersection(40, gameHeight + 235, 50, 50)) {
        s.dir(-1, 0);
    }
    else if (mouseIntersection(160, gameHeight + 235, 50, 50)) {
        s.dir(1, 0);
    }
}

function mouseIntersection(rx, ry, rw, rh) {
  return mouseX >= rx &&
    mouseX <= rx + rw &&
    mouseY > ry &&
    mouseY <= ry + rh;
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
        s.eaten.splice(i, 1);

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
            findWord(substrings[i].split(''));
          }
        }
        if (substrings.includes(display1)) {
        	console.log("Bonus Life!!!");
        	//TODO Anthony - add in whatever happens when you get the target word
        	//load a new target word
            spelledTarget++;
      //   	clearThings();
    		// initLetters();
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
    if (spelledTarget <= 0) {
        clearThings();
        initLetters();
    }
    else {
        spelledTarget--;
        eatenLetters = [];
        display1 = random(myOwn);
    }

  }

  s.update();
  s.show();

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
	// the target words will go inside these boxes-- ateachey3
    fill(213, 48, 50);
	rect(0, gameHeight, gameWidth, 100);
    //fill('red');
    rect(100, gameHeight + 200, 50, 50);
    rect(40, gameHeight + 235, 50, 50);
    rect(160, gameHeight + 235, 50, 50);
    rect(100, gameHeight + 260, 50, 50);
	fill(255);
	text(display1, gameWidth/2, gameHeight + 65);
    // touch pads --ateachey

  fill(213, 48, 50);
  var str = "score:" + score;
  text(str, 75, gameHeight + 130, scl, scl);
  //draw words eaten
  if (wordsEaten) {
    for (var i = 0; i < wordsEaten.length; i++) {
      text(wordsEaten[i], 75, gameHeight + 130 + (i+1)*30, scl, scl);
    }
  }
}

function keyPressed() {
    //if (!spelledTarget) {
          if (keyCode === UP_ARROW) {
            s.dir(0, -1);
          } else if (keyCode === DOWN_ARROW) {
            s.dir(0, 1);
          } else if (keyCode === RIGHT_ARROW) {
            s.dir(1, 0);
          } else if (keyCode === LEFT_ARROW) {
            s.dir(-1, 0);
          }
    //}
    /**
    else {
        if (keyCode === UP_ARROW) {
            s.dir(0, -0.75);
          } else if (keyCode === DOWN_ARROW) {
            s.dir(0, 0.75);
          } else if (keyCode === RIGHT_ARROW) {
            s.dir(0.75, 0);
          } else if (keyCode === LEFT_ARROW) {
            s.dir(-0.75, 0);
          }
    }
    **/
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
