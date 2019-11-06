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
        console.log('starting over');
        this.total = 0;
        this.eaten = [];
        this.tail = [];
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
    for (var i = 0; i < this.eaten.length; i++) {
      textAlign(CENTER);
      textSize(scl);
      if (eatenLettersInWord.includes(i)) {
        fill(255, 128, 0);
      } else {
         fill(255);
      }
      text(eatenLetters[i], this.tail[i].x, this.tail[i].y, scl, scl);
    }
    fill(255);
    rect(this.x, this.y, scl, scl);

  }
}
