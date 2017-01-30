function Circle(cx, cy, html_id, r=10)
{
  r = r || 10;
  this.html_id = html_id;
  this.info = { cx: cx,  cy: cy, r: r };

  //private function that generates a random number
  var randomNumberBetween = function(min, max){
    return Math.random()*(max-min) + min;
  }

  this.initialize = function(){
    //give a random velocity for the circle
    this.info.velocity = {
      x: randomNumberBetween(-3,3),
      y: randomNumberBetween(-3,3)
    }

    //create a circle
    var circle = makeSVG('circle',
      { 	cx: this.info.cx,
          cy: this.info.cy,
          r:  this.info.r,
          id: html_id,
          style: "fill: black"
      });

    document.getElementById('svg').appendChild(circle);
  }

  this.update = function(time){
    var el = document.getElementById(html_id);

    //see if the circle is going outside the browser. if it is, reverse the velocity
    if( this.info.cx > document.body.clientWidth - this.info.r || this.info.cx < this.info.r)
    {
      this.info.velocity.x = this.info.velocity.x * -1;
    }
    if( this.info.cy > document.body.clientHeight - this.info.r || this.info.cy < this.info.r)
    {
      this.info.velocity.y = this.info.velocity.y * -1;
    }

    this.info.cx = this.info.cx + this.info.velocity.x*time;
    this.info.cy = this.info.cy + this.info.velocity.y*time;

    el.setAttribute("cx", this.info.cx);
    el.setAttribute("cy", this.info.cy);
    el.setAttribute("r", this.info.r);
  }

  //creates the SVG element and returns it
  var makeSVG = function(tag, attrs) {
        var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
        {
            el.setAttribute(k, attrs[k]);
        }
        return el;
    }

    this.initialize();
}

function PlayGround()
{
  var counter = 0;  //counts the number of circles created
  var circles = [ ]; //array that will hold all the circles created in the app

  //a loop that updates the circle's position on the screen
  this.loop = function(){
    if (circles.length > 1){
      var circlesWithinX = [];
      var pairsWithinXY = [];
      var pairsWithinXY_hash = {};
      var pairsWithinXY_filtered = [];
      var actualCollisions = [];

      circles.forEach(function (circle1) {
        circles.forEach(function (circle2) {
          if (circle1 && circle2) {
            var r1 = circle1.info.r;
            var r2 = circle2.info.r;

            var distanceMax = circle1.info.r + circle2.info.r;
            var distanceMin = 0;

            var actualDistance = Math.abs(circle1.info.cx - circle2.info.cx);

            if ((actualDistance <= distanceMax && actualDistance >= distanceMin) && circle1.html_id !== circle2.html_id) {
              circlesWithinX.push([circle1, circle2]);
            }
          }
        });
      });

      circlesWithinX.forEach(function (pair) {
        var r1 = pair[0].info.r;
        var r2 = pair[1].info.r;

        var distanceMax = pair[0].info.r + pair[1].info.r;
        var distanceMin = 0;

        var actualDistance = Math.abs(pair[0].info.cy - pair[1].info.cy);

        if (actualDistance <= distanceMax && actualDistance >= distanceMin) {
          pairsWithinXY.push([pair[0].html_id, pair[1].html_id].sort());
        }
      });

      pairsWithinXY.filter(function (item) {
        return pairsWithinXY_hash.hasOwnProperty(item) ? false : (pairsWithinXY_hash[item] = true);
      });

      pairsWithinXY_filtered = Object.keys(pairsWithinXY_hash).map(function (item) {
        var strToArr = item.split(",");
        strToArr.forEach(function (ele, i, self) {
          self[i] = parseInt(ele, 10);
        });
        return strToArr;
      });

      pairsWithinXY_filtered.forEach(function (pair) {
        var distanceMax = circles[pair[0]].info.r + circles[pair[1]].info.r;
        var distanceMin = 0;

        var actualDistance = Math.sqrt((circles[pair[1]].info.cx - circles[pair[0]].info.cx)**2 + (circles[pair[1]].info.cy - circles[pair[0]].info.cy)**2);

        if (actualDistance <= distanceMax && actualDistance >= distanceMin) {
          actualCollisions.push(pair);
        }
      });

      actualCollisions.forEach(function (pair) {
        var r1 = circles[pair[0]].info.r;
        var r2 = circles[pair[1]].info.r;

        var new_x = (circles[pair[0]].info.cx + circles[pair[1]].info.cx)/2;
        var new_y = (circles[pair[0]].info.cy + circles[pair[1]].info.cy)/2;

        var new_r;
        var new_velo;

        if (r1 >= r2) {
          new_r = r1 + (r2*0.2);
          new_velo = circles[pair[0]].info.velocity;
        } else {
          new_r = r2 + (r1*0.2);
          new_velo = circles[pair[1]].info.velocity;
        }

        var rx = 1000000,
            ry = 1000000;

        // figure out square boundaries of the circle
        var topLeft = [new_x - new_r, new_y - new_r],
            topRight = [new_x + new_r, new_y - new_r],
            botLeft = [new_x - new_r, new_y + new_r],
            botRight = [new_x + new_r, new_y + new_r];

        if (topLeft[0] < 0 || botLeft[0] < 0) { // left out of bounds
          rx = new_x - 1;
        }
        if (topRight[0] > document.body.clientWidth || botRight > document.body.clientWidth) { // right out of bounds
          rx = document.body.clientWidth - new_x - 1;
        }
        if (topLeft[1] < 0 || topRight[1] < 0) { // top out of bounds
          ry = new_y - 1;
        }
        if (botLeft[1] > document.body.clientHeight || botRight[1] > document.body.clientHeight) { // bot out of bounds
          ry = document.body.clientHeight - new_y - 1;
        }

        new_r = [new_r, rx, ry].sort(function (a, b) { return a - b; })[0];


        var new_circle = new Circle(new_x, new_y, counter++, new_r);
        circles.push(new_circle);

        circles[pair[0]] = undefined;
        circles[pair[1]] = undefined;

        var circle1 = document.getElementById(pair[0].toString());
        var circle2 = document.getElementById(pair[1].toString());

        circle1.parentNode.removeChild(circle1);
        circle2.parentNode.removeChild(circle2);
      });
    }

    for (circle in circles){
      if (circles[circle] != undefined) {
        circles[circle].update(1);
      }
    }
  }

  this.createNewCircle = function(x,y,r){
    var new_circle = new Circle(x,y,counter++,r);
    circles.push(new_circle);
    // console.log('created a new circle!', new_circle);
  }

  //create one circle when the game starts
  this.createNewCircle(document.body.clientWidth/2, document.body.clientHeight/2);
}

var playground = new PlayGround();
setInterval(playground.loop, 15);


var mousedown_time;

function getTime(){
  var date = new Date();
  return date.getTime();
}

document.onmousedown = function(e){
  mousedown_time = getTime();
}
document.onmouseup = function(e){
  time_pressed = getTime() - mousedown_time;
  var r = time_pressed * 0.2;

  var pointDistance = function (coords1, coords2) {
    return (Math.sqrt((coords2[0] - coords1[0]) ** 2 + (coords2[1] - coords1[1]) ** 2));
  }

  var rx = 1000000,
      ry = 1000000;

  // figure out square boundaries of the circle
  var topLeft = [e.x - r, e.y - r],
      topRight = [e.x + r, e.y - r],
      botLeft = [e.x - r, e.y + r],
      botRight = [e.x + r, e.y + r];

  if (topLeft[0] < 0 || botLeft[0] < 0) { // left out of bounds
    rx = e.x - 1;
  }
  if (topRight[0] > document.body.clientWidth || botRight > document.body.clientWidth) { // right out of bounds
    rx = document.body.clientWidth - e.x - 1;
  }
  if (topLeft[1] < 0 || topRight[1] < 0) { // top out of bounds
    ry = e.y - 1;
  }
  if (botLeft[1] > document.body.clientHeight || botRight[1] > document.body.clientHeight) { // bot out of bounds
    ry = document.body.clientHeight - e.y - 1;
  }

  r = [r, rx, ry].sort(function (a, b) { return a - b; })[0];


  playground.createNewCircle(e.x,e.y,r);
}
