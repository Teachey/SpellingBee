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
        wall.play(); //play running into wall sound
        if (score >= 50) {
          score = score - 50;
          bonusText = "-50";
          bonusFading = true;
          bonusTextLocation = createVector(s.x, s.y);
        } else {
          if (score != 0) {
            bonusText = "-" + score;
            bonusFading = true;
            bonusTextLocation = createVector(s.x, s.y);
          }
          score = 0;
        }
        return true;
      }
    }
    return false;
  }

  this.update = function () {
    for (var i = 0; i < this.tail.length - 1; i++) {
      if (!betweenLevels) {
        this.tail[i] = this.tail[i + 1];
      } 
    }
    if (this.total >= 1 && !betweenLevels) {
        this.tail[this.total - 1] = createVector(this.x, this.y);
    } 
    if (!betweenLevels) {
      this.x = this.x + this.xspeed * scl;
      this.y = this.y + this.yspeed * scl;
      this.x = constrain(this.x, 0, gameWidth - scl);
      this.y = constrain(this.y, 0, gameHeight - scl);
    }
      if (betweenLevels) {
  console.log("UPDATE DONE");
}
  }

  this.drawBeeHeadAndTail = function(img, triX1Off, triY1Off, triX2Off, triY2Off, triX3Off, triY3Off) {
    image(img, this.x, this.y, scl, scl);
    fill(0, 0, 0);
    if (this.tail.length > 0) {
      triangle(this.tail[0].x + triX1Off, this.tail[0].y + triY1Off, this.tail[0].x + triX2Off, this.tail[0].y + triY2Off, this.tail[0].x + triX3Off, this.tail[0].y + triY3Off);
    } else {
      triangle(this.x + triX1Off, this.y + triY1Off, this.x + triX2Off, this.y + triY2Off, this.x + triX3Off, this.y + triY3Off);
    }
  }

  this.drawBeeWings = function(xOffset1, yOffset1, xOffset2, yOffset2, circXOff, circYOff, sclX, sclY) {
    //draw wings overlapping with bee tail
    if (this.tail.length > 0) {
      fill(115, 194, 251, 127);
      ellipse(this.tail[this.tail.length-1].x + xOffset1, this.tail[this.tail.length-1].y + yOffset1, sclX, sclY);
      ellipse(this.tail[this.tail.length-1].x + xOffset2, this.tail[this.tail.length-1].y + yOffset2, sclX, sclY);
    } else {
      //draw initial bee body
      fill(255,223,0);
      circle(this.x + circXOff, this.y + circYOff, scl);
      fill(115, 194, 251, 127);
      ellipse(this.x + xOffset1, this.y + yOffset1, sclX, sclY);
      ellipse(this.x + xOffset2, this.y + yOffset2, sclX, sclY);
    }
  }

  this.show = function () {
    //TODO: a way to minimize the number of conditionals?
    //Draw head and stinger
    if (this.xspeed == 0 && this.yspeed == -1) {
      //moving up
      if (this.tail.length > 0) {
        this.drawBeeHeadAndTail(beeHeadUp, scl/2 - 10, scl*.8, scl/2 + 10, scl*.8, scl/2, scl*.8 + scl/2 - 5);
      } else {
        this.drawBeeHeadAndTail(beeHeadUp, scl/2 - 10, scl + scl*.8, scl/2 + 10, scl + scl*.8, scl/2, scl + scl*.8 + scl/2 - 5);
      }
    } else if (this.xspeed == -1 && this.yspeed == 0) {
      //moving left
      if (this.tail.length > 0) {
        this.drawBeeHeadAndTail(beeHeadLeft, scl*.8, scl/2 - 10, scl*.8, scl/2 + 10, scl*.8 + scl/2 - 5, scl/2);
      } else {
        this.drawBeeHeadAndTail(beeHeadLeft, scl + scl*.8, scl/2 - 10, scl + scl*.8, scl/2 + 10, scl + scl*.8 + scl/2 - 5, scl/2);
      }
    } else if (this.xspeed == 0 && this.yspeed == 1) {
      //moving down
      if (this.tail.length > 0) {
        this.drawBeeHeadAndTail(beeHeadDown, scl/2 - 10, -scl*.8 + scl, scl/2 + 10, -scl*.8 + scl, scl/2, -scl*.8 + scl- scl/2 + 5);
      } else {
        this.drawBeeHeadAndTail(beeHeadDown, scl/2 - 10, -scl*.8, scl/2 + 10, -scl*.8, scl/2, -scl*.8 - scl/2 + 5);
      } 
    } else {
      //moving right
      if (this.tail.length > 0) {
        this.drawBeeHeadAndTail(beeHeadRight, -scl*.8 + scl, scl/2 + 10, -scl*.8 + scl, scl/2 - 10, -scl*.8 + scl - scl/2 + 5, scl/2);
      } else {
        this.drawBeeHeadAndTail(beeHeadRight, -scl*.8, scl/2 + 10, -scl*.8, scl/2 - 10, -scl*.8 - scl/2 + 5, scl/2);
      }
    }

    //Draw letters in bee
    for (var i = 0; i < this.eaten.length; i++) {
      var textOpacity;
      if (this.tail[i]) {
        if (eatenLettersInWord.includes(i)) {
          textStyle(BOLD);
          stroke(0, 0, 0);
          strokeWeight(4);
          textOpacity = 256;
        } else {
          textStyle(NORMAL);
          strokeWeight(0);
          textOpacity = 75;
        }
        fill(255,223,0);
        circle(this.tail[i].x + scl/2, this.tail[i].y + scl/2, scl);
        strokeWeight(0);
        fill(0, 0, 0, textOpacity);
        textAlign(CENTER, CENTER);
        textSize(scl/2);
        text(eatenLetters[i].toUpperCase(), this.tail[i].x + 5, this.tail[i].y, scl, scl); 
      }
    }
    textStyle(NORMAL);
      
    //Draw wings -- TODO: is there a way to minimize number of conditionals?
    if (this.xspeed == 0 && this.yspeed == -1) {
      //moving up
      if (this.tail.length > 0) {
        this.drawBeeWings(scl/8, 0, scl - scl/8, 0, scl/2, scl + scl/2, scl, scl/2);
      } else {
        this.drawBeeWings(scl/8, scl, scl - scl/8, scl, scl/2, scl + scl/2, scl, scl/2);
      }
    } else if (this.xspeed == -1 && this.yspeed == 0) {
      //moving left
      if (this.tail.length > 0) {
        this.drawBeeWings(0, scl/8, 0, scl - scl/8, scl + scl/2, scl/2, scl/2, scl);
      } else {
        this.drawBeeWings(scl, scl/8, scl, scl - scl/8, scl + scl/2, scl/2, scl/2, scl);
      }
    } else if (this.xspeed == 0 && this.yspeed == 1) {
      //moving down
      if (this.tail.length > 0) {
        this.drawBeeWings(scl/8, scl, scl - scl/8, scl, scl/2, -scl + scl/2, scl, scl/2);
      } else {
        this.drawBeeWings(scl/8, 0, scl - scl/8, 0, scl/2, -scl + scl/2, scl, scl/2);
      }
    } else {
      //moving right
      if (this.tail.length > 0) {
        this.drawBeeWings(scl, scl/8, scl, scl - scl/8, -scl + scl/2, scl/2, scl/2, scl);
      } else {
        this.drawBeeWings(0, scl/8, 0, scl - scl/8, -scl + scl/2, scl/2, scl/2, scl);
      }
    }
  }
}
