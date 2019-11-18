// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/AaGK-fj-BAM

function Snake() {
  this.x = 0;
  this.y = 0;
  this.xspeed = 0;
  this.yspeed = 0;
  this.total = 0;
  this.tail = [];
  this.eaten = [];

  this.eat = function (pos) {
    var d = dist(this.x, this.y, pos.x, pos.y);
    if (d < 1) {
      this.total++;
      this.eaten.push(pos);
      return true;
    } else {
      return false;
    }
  }

  this.dir = function (x, y) {
    this.xspeed = x;
    this.yspeed = y;
  }

  this.death = function () {
    for (var i = 0; i < this.tail.length; i++) {
      var pos = this.tail[i];
      var d = dist(this.x, this.y, pos.x, pos.y);
      if (d < 1) {
        this.total = 0;
        this.eaten = [];
        this.tail = [];
        wall.play(); //Duri added this line 
        return true;
      }
    }
    return false;
  }

  this.update = function () {
    for (var i = 0; i < this.tail.length - 1; i++) {
      this.tail[i] = this.tail[i + 1];
    }
    if (this.total >= 1) {
      this.tail[this.total - 1] = createVector(this.x, this.y);
    }

    this.x = this.x + this.xspeed * scl;
    this.y = this.y + this.yspeed * scl;

    this.x = constrain(this.x, 0, gameWidth - scl);
    this.y = constrain(this.y, 0, gameHeight - scl);
  }

  this.show = function () {
      //TODO: fix code below so nothing is hardcoded
      if (this.xspeed == 0 && this.yspeed == -1) {
        //moving up
        fill(0, 0, 0);
        image(wingsUp, this.x, this.y + scl*(3/4), scl, scl);
        image(beeHeadUp, this.x, this.y, scl, scl);
      } else if (this.xspeed == -1 && this.yspeed == 0) {
        //moving left
        fill(0, 0, 0);
        image(wingsLeft, this.x + scl*(3/4), this.y, scl, scl);
        image(beeHeadLeft, this.x, this.y, scl, scl);
      } else if (this.xspeed == 0 && this.yspeed == 1) {
        //moving down
        fill(0, 0, 0);
        image(wingsDown, this.x, this.y - scl*(3/4), scl, scl);
        image(beeHeadDown, this.x, this.y, scl, scl);
      } else {
        //moving right
        fill (0, 0, 0);
        image(wingsRight, this.x - scl*(3/4), this.y, scl, scl);
        image(beeHeadRight, this.x, this.y, scl, scl);
      }
      for (var i = 0; i < this.eaten.length; i++) {
        textAlign(CENTER, CENTER);
        textSize(scl/2);
        fill(255,223,0);
        if (eatenLettersInWord.includes(i)) {
          stroke(0, 0, 0);
          strokeWeight(4);
        } else {
          strokeWeight(0);
        }
        //TODO: fix code below so nothing is hardcoded
        if (this.xspeed == 0 && this.yspeed == -1) {
          //moving up
          circle(this.tail[i].x + scl/2, this.tail[i].y + scl*(3/4) + scl/2, scl);
          strokeWeight(0);
          fill(0, 0, 0);
          text(eatenLetters[i].toUpperCase(), this.tail[i].x, this.tail[i].y + scl*(3/4), scl, scl);
        } else if (this.xspeed == -1 && this.yspeed == 0) {
          //moving left
          circle(this.tail[i].x + scl*(3/4) + scl/2, this.tail[i].y + scl/2, scl);
          strokeWeight(0);
          fill(0, 0, 0);
          text(eatenLetters[i].toUpperCase(), this.tail[i].x + scl*(3/4), this.tail[i].y, scl, scl);
        } else if (this.xspeed == 0 && this.yspeed == 1) {
          //moving down
          circle(this.tail[i].x + scl/2, this.tail[i].y - scl*(3/4) + scl/2, scl);
          strokeWeight(0);
          fill(0, 0, 0);
          text(eatenLetters[i].toUpperCase(), this.tail[i].x, this.tail[i].y - scl*(3/4), scl, scl);
        } else {
          //moving right
          circle(this.tail[i].x + scl/2 - scl*(3/4), this.tail[i].y + scl/2, scl);
          strokeWeight(0);
          fill(0, 0, 0);
          text(eatenLetters[i].toUpperCase(), this.tail[i].x - scl*(3/4), this.tail[i].y, scl, scl);
        }
      }
  }
}
