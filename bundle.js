(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/karen/Documents/my_project/tweak/drawCanvas.js":[function(require,module,exports){
module.exports = LittleCanvas;

var mMath = require('./math');
var math = new mMath();
var PVector = require('./pvector');

function LittleCanvas(beginPointX, beginPointY) {
  this.width = 320;
  this.height = 240;
  this.radius = 5;
  this.beginX = beginPointX + this.radius;
  this.beginY = beginPointY + this.radius + 10;
  this.endX = beginPointX + this.width - this.radius;
  this.endY = beginPointY + this.height - this.radius - 10;
  this.time = 0;
  this.isDrawingStart = false;
  this.isDrawingDone = false;
  this.path = new paper.Path();
  this.interval = 5;
  this.stop = 0;
  this.texts = [];

  //making begin and end point
  this.beginP = new paper.Path.Circle(this.beginX, this.beginY, this.radius);
  this.endP = new paper.Path.Circle(this.endX, this.endY, this.radius);
  this.beginP.strokeColor = 'white';
  this.endP.strokeColor = 'white';

  //making draw area
  this.drawArea = new paper.Path.Rectangle(beginPointX, beginPointY,
    this.width,
    this.height);
  this.drawArea.strokeColor = 'white';

  //group items
  this.boundGroup = new paper.Group();
  this.pathGroup = new paper.Group();
  this.textGroup = new paper.Group();

  this.pathGroup.addChild(this.path);

  this.boundGroup.addChild(this.drawArea);
  this.boundGroup.addChild(this.beginP);
  this.boundGroup.addChild(this.endP);

  //set hitOptions for edite
  this.hitOptions = {
    segments: true,
    stroke: true,
    fill: false,
    tolerance: 5
  };

  //making interval x path
  this.verticalPaths = [];
  for (var i = this.beginX; i <= beginPointX + this.width; i += this.interval) {
    var verticalPath = new paper.Path.Line(i, beginPointY, i, beginPointY +
      this.height);
    //verticalPath.strokeColor = 'black';
    this.verticalPaths.push(verticalPath);
  }
}

LittleCanvas.prototype.onMouseDown = function (e) {
  if (this.drawArea.bounds.contains(e.point)) {
    if (isDrawingMode) {
      if (this.beginP.bounds.contains(e.point)) {
        this.beginP.fillColor = 'blue';
        this.path.strokeColor = {
          gradient: {
            stops: ['blue', 'red', 'yellow']
          },
          origin: [this.beginX, this.beginY],
          destination: [this.endX, this.endY]
        };
        this.path.strokeWidth = 4;
        this.path.add(new paper.Point(this.beginX - this.radius, this.beginY));
        this.isDrawingStart = true;
      }
    } else {
      this.hitSegment = null;
      var hitResult = paper.project.hitTest(e.point, this.hitOptions);
      if (!hitResult) {
        return;
      }
      if (e.modifiers.shift) {
        if (hitResult.type === 'segment') {
          hitResult.segment.remove();
        }
        return;
      }
      //only modify points on the path
      if (hitResult.item.parent === this.pathGroup) {
        if (hitResult.type === 'segment') {
          this.hitSegment = hitResult.segment;
        } else if (hitResult.type === 'stroke') {
          var location = hitResult.location;
          this.hitSegment = this.path.insert(location.index + 1, e.point);
          this.path.smooth();
        }
      }
    }
  }
};

LittleCanvas.prototype.onMouseDrag = function (e) {
  var that = this;
  if (this.drawArea.bounds.contains(e.point)) {
    if (isDrawingMode) {
      this.path.segments.forEach(function (s, index) {
        if (s.point.x >= e.point.x) {
          that.path.removeSegment(index);
        }
      });
      this.path.add(e.point);

      if (this.endP.bounds.contains(e.point)) {
        this.endP.fillColor = "yellow";
      }
    } else if (this.hitSegment) {
      var index = this.hitSegment.index;
      this.hitSegment.point.y += e.delta.y;
      this.hitSegment.point.x += e.delta.x;
      this.hitSegment.point.x = math.constrain(this.hitSegment.point.x, this.path
        .segments[
          index - 1].point.x + 0.0000001, this.path.segments[index + 1]
        .point.x -
        0.0000001);
    }
  }
};

LittleCanvas.prototype.modify = function () {
  for (var j = 0; j < this.path.segments.length - 1; j++) {
    if (this.path.segments[j].point.x >= this.path.segments[j + 1].point.x) {
      this.path.removeSegment(j + 1);
      console.log("delete the " + j + "th segment");
    }
  }

  for (var i = 1; i < this.path.segments.length - 1; i++) {
    var p = this.path.segments[i].point;
    var pNxt = this.path.segments[i + 1].point;
    var pPre = this.path.segments[i - 1].point;

    var hdlIn = {
      x: p.x + this.path.segments[i].handleIn.x,
      y: p.y + this.path.segments[i].handleIn.y,
    };

    //actually this is a function called angleBetween in processing
    var hdlInVctr = new PVector(hdlIn.x - p.x, hdlIn.y - p.y);
    var pointsInVctr = new PVector(pPre.x - p.x, pPre.y - p.y);
    var hdlInDis = hdlInVctr.mag();
    var pointsInDis = pointsInVctr.mag();
    var thetaIn = Math.acos(hdlInVctr.dot(pointsInVctr) /
      (hdlInDis * pointsInDis));
    console.log("point " + i + " has a handleIn angle value of " +
      thetaIn + ", a handleIn dist of " + hdlInDis);

    var hdlInOri = null;
    var timerIn = 0;
    if (timerIn === 0) {
      hdlInOri = {
        x: hdlIn.x,
        y: hdlIn.y
      };
      timerIn++;
    }
    var b = 0.001;

    while (thetaIn > 0.8 && hdlInDis > 40 || hdlInDis > 60) {
      console.log("modifying " + i + "th point's handleIn distance " + hdlInDis);
      this.path.segments[i].handleIn.x = math.lerp(hdlIn.x, p.x, b) - p.x;
      this.path.segments[i].handleIn.y = math.lerp(hdlIn.y, p.y, b) - p.y;
      b += 0.001;
      hdlIn = {
        x: p.x + this.path.segments[i].handleIn.x,
        y: p.y + this.path.segments[i].handleIn.y,
      };
      hdlInVctr = new PVector(hdlIn.x - p.x, hdlIn.y - p.y);
      hdlInDis = hdlInVctr.mag();
    }

    var hdlOut = {
      x: p.x + this.path.segments[i].handleOut.x,
      y: p.y + this.path.segments[i].handleOut.y
    };
    //
    //actually this is a function called angleBetween in processing
    var hdlOutVctr = new PVector((hdlOut.x - p.x), (hdlOut.y - p.y));
    var pointsVctr = new PVector((pNxt.x - p.x), (pNxt.y - p.y));
    var hdlOutDis = hdlOutVctr.mag();
    var pointsDis = pointsVctr.mag();
    var thetaOut = Math.acos(hdlOutVctr.dot(pointsVctr) /
      (hdlOutDis * pointsDis));
    //
    console.log("point " + i + " has a handleOut angle value of " +
      thetaOut + ", a handleOut dist of " + hdlOutDis);

    var hdlOutOri = null;
    var timerOut = 0;
    if (timerOut === 0) {
      hdlOutOri = {
        x: hdlOut.x,
        y: hdlOut.y
      };
      timerOut++;
    }

    var a = 0.001;

    while (thetaOut > 0.8 && hdlOutDis > 40 || hdlOutDis > 60) {
      console.log("modifying " + i + "th point's handleOut" + hdlOutDis);
      this.path.segments[i].handleOut.x = math.lerp(hdlOutOri.x, p.x, a) -
        p.x;
      this.path.segments[i].handleOut.y = math.lerp(hdlOutOri.y, p.y, a) -
        p.y;
      a += 0.001;
      hdlOut = {
        x: p.x + this.path.segments[i].handleOut.x,
        y: p.y + this.path.segments[i].handleOut.y
      };
      hdlOutVctr = new PVector((hdlOut.x - p.x), (hdlOut.y - p.y));
      hdlOutDis = hdlOutVctr.mag();
    }
  }
};

LittleCanvas.prototype.onMouseUp = function (e) {
  if (this.isDrawingStart) {
    if (isDrawingMode) {
      if (!this.endP.bounds.contains(e.point)) {
        this.path.add(new paper.Point(this.endX, this.endY));
      }
      this.endP.fillColor = 'yellow';
      this.path.firstSegment.point.x = this.beginX;
      this.path.firstSegment.point.y = this.beginY;
      this.path.lastSegment.point.x = this.endX;
      this.path.lastSegment.point.y = this.endY;
      this.isDrawingDone = true;
      this.isDrawingStart = false;
      this.path.smooth();
      this.path.simplify();
      this.modify();
      var that = this;
      this.path.segments.forEach(function (s, index) {
        var t = new paper.PointText({
          point: s.point,
          fillColor: 'white',
          fontSize: 10,
          content: index,
        });
        that.texts.push(t);
        that.textGroup.addChild(t);
      });
    }
  }
};

LittleCanvas.prototype.getValue = function () {
  this.value = [];
  var that = this;
  this.verticalPaths.forEach(function (pa) {
    var intersections = that.path.getIntersections(pa);
    intersections.forEach(function (intersection) {
      that.value.push([intersection.point.x, intersection.point.y]);
    });
  });
  //console.log("return location data amount of " + this.value.length);
};

LittleCanvas.prototype.setInput = function (property, start, end,
  totalSeconds) {
  this.property = property;
  this.block = Math.floor(60 / this.verticalPaths.length * totalSeconds);
  if (this.boo) {
    this.boo.remove();
  }
  switch (this.property) {
  case 'y':
    //making moving ball
    this.boo = new paper.Path.Circle(this.beginX + this.width, this.beginY,
      this.radius);
    this.start = start + this.beginY;
    this.end = end + this.beginY;
    break;
  case 'x':
    this.boo = new paper.Path.Circle(this.beginX + this.width, (this.endY -
      this.beginY) / 2, this.radius);
    this.start = start + this.width + this.beginX;
    this.end = end + this.width + this.beginX;
    break;
  case 'size':
    this.boo = new paper.Path.Circle(this.beginX + this.width, (this.endY -
      this.beginY) / 2, this.radius);
    break;
  default:
    this.boo = new paper.Path.Circle(this.beginX + this.width, this.beginY,
      this.radius);
  }
  this.boo.fillColor = 'white';
};

LittleCanvas.prototype.mapValue = function (frameCount) {
  if (frameCount % this.block === 0 && this.value.length !== 0) {
    switch (this.property) {
    case 'y':
      this.boo.position.y = math.map(this.value[this.time][1], this.beginY,
        this.endY,
        this.start, this.end);
      break;
    case 'x':
      this.boo.position.x = math.map(this.value[this.time][1], this.beginY,
        this.endY,
        this.start, this.end);
      break;
    case 'size':
      this.boo.bounds.width = this.value[this.time][1] / 2;
      this.boo.bounds.height = this.value[this.time][1] / 2;
      break;
    default:
      //do nothing;
    }
    if (this.time < this.value.length - 1) {
      this.time++;
    } else {
      this.stop++;
      if (this.stop > 30) {
        this.time = 0;
        this.stop = 0;
      }
    }
  }
};
},{"./math":"/Users/karen/Documents/my_project/tweak/math.js","./pvector":"/Users/karen/Documents/my_project/tweak/pvector.js"}],"/Users/karen/Documents/my_project/tweak/math.js":[function(require,module,exports){
module.exports = math;

function math() {

}

math.prototype.map = function (para, orMin, orMax, tarMin, tarMax) {
  var ratio = (para - orMin) / (orMax - orMin);
  var tarValue = ratio * (tarMax - tarMin) + tarMin;
  return tarValue;
};

math.prototype.constrain = function (item, min, max) {
  if (item < min) return min;
  else if (item > max) return max;
  else return item;
};

math.prototype.dist = function (point1X, point1Y, point2X, point2Y) {
  var dX = point1X - point2X;
  var dY = point1Y - point2Y;
  var dis = Math.sqrt((Math.pow(dX, 2) + Math.pow(dY, 2)));
  return dis;
};

math.prototype.lerp = function (start, stop, amt) {
  var value = (stop - start) * amt + start;
  return value;
};
},{}],"/Users/karen/Documents/my_project/tweak/pvector.js":[function(require,module,exports){
module.exports = PVector;

function PVector(x, y) {
  if (!(this instanceof PVector)) {
    return new PVector(x, y);
  }

  this.x = x || 0;
  this.y = y || 0;
  return this;
};

PVector.fromAngle = function (angle) {
  return new PVector(Math.cos(angle), Math.sin(angle));
};

PVector.prototype.set = function (x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

PVector.prototype.add = function (other) {
  this.x += other.x;
  this.y += other.y;
  return this;
};

PVector.add = function (one, other) {
  return new PVector(one.x + other.x, one.y + other.y);
};

PVector.prototype.sub = function (other) {
  this.x -= other.x;
  this.y -= other.y;
  return this;
};

PVector.sub = function (one, other) {
  return new PVector(one.x - other.x, one.y - other.y);
};

PVector.prototype.div = function (n) {
  this.x /= n;
  this.y /= n;
  return this;
};

PVector.div = function (vector, n, target) {
  if (target instanceof PVector) {
    target.x = vector.x / n;
    target.y = vector.y / n;
    return target;
  }
  return new PVector(vector.x / n, vector.y / n);
};

PVector.prototype.mult = function (rate) {
  this.x *= rate;
  this.y *= rate;
  return this;
};

PVector.mult = function (vector, n, target) {
  if (target instanceof PVector) {
    target.x = vector.x * n;
    target.y = vector.y * n;
    return target;
  }
  return new PVector(vector.x * n, vector.y * n);
};

PVector.prototype.dot = function (p) {
  return this.x * p.x + this.y * p.y;
};

PVector.dot = function (a, b) {
  return a.x * b.x + a.y * b.y;
};

PVector.prototype.mag = function () {
  return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
};

PVector.dist = function (loc1, loc2) {
  return Math.sqrt(Math.pow(loc1.x - loc2.x, 2) + Math.pow(loc1.y - loc2.y,
    2));
};

PVector.prototype.normalize = function () {
  var mag = this.mag();
  if (mag === 0) {
    this.x = 0;
    this.y = 0;
  } else {
    this.x /= mag;
    this.y /= mag;
  }
  return this;
};

PVector.prototype.limit = function (limit) {
  if (this.mag() <= limit) {
    return this;
  }
  this.normalize();
  this.x *= limit;
  this.y *= limit;
  return this;
};

PVector.prototype.setMag = function (mag) {
  this.normalize();
  this.x *= mag;
  this.y *= mag;
  return this;
};

PVector.prototype.clone = function () {
  return new PVector(this.x, this.y);
};

PVector.random2D = function (vector) {
  var num = utils.random(2 * Math.PI);
  var x = Math.sin(num);
  var y = Math.cos(num);
  if (!vector) {
    return new PVector(x, y);
  }
  vector.x = x;
  vector.y = y;
  return vector;
};

PVector.prototype.heading = function () {
  if (this.x === 0) {
    return this.y > 0 ? Math.PI / 2 : Math.PI / -2;
  }
  var theta = Math.atan(this.y / this.x);
  if (this.x > 0) {
    return theta;
  } else {
    return Math.PI + theta;
  }
  return Math.atan(this.y / this.x);
};

PVector.prototype.rotate = function (a) {
  var newHeading = this.heading() + a;
  var mag = this.mag();
  this.x = Math.cos(newHeading) * mag;
  this.y = Math.sin(newHeading) * mag;
  return this;
};

PVector.angleBetween = function (a, b) {
  // A dot B = (magnitude of A)*(magnitude of B)*cos(theta)
  var dot = a.dot(b);
  return Math.acos(dot / (a.mag() * b.mag()));
};

PVector.prototype.angleBetween = function (other) {
  var dot = this.dot(other);
  return Math.acos(dot / (this.mag() * other.mag()));
};
},{}],"/Users/karen/Documents/my_project/tweak/test.js":[function(require,module,exports){
paper.setup(myCanvas);

var LittleCanvas = require('./drawCanvas');
//var editor = require('./editor');
var littleCanvases = [];

window.onload = function () {

  for (var itr = 0; itr < 3; itr++) {
    littleCanvases[itr] = new LittleCanvas(itr * 420 + 20, 40);
  }
  var tool = new paper.Tool();
  tool.minDistance = 10;
  tool.maxDistance = 60;
  var frameCount = 0;

  tool.onMouseDown = function (e) {
    littleCanvases.forEach(function (c) {
      c.onMouseDown(e);
    });
  };

  tool.onMouseDrag = function (e) {
    littleCanvases.forEach(function (c) {
      c.onMouseDrag(e);
    });
  };

  tool.onMouseUp = function (e) {
    littleCanvases.forEach(function (c) {
      c.onMouseUp(e);
      c.setInput('y', 10, 210, 2);
      c.time = 0;
      c.getValue();
    });
  };

  tool.onMouseMove = function (e) {
    if (!isDrawingMode) {
      paper.project.activeLayer.selected = false;
      if (e.item) {
        //e.item.fullySelected = true;
        littleCanvases.forEach(function (c) {
          if (e.item === c.pathGroup) {
            e.item.children.forEach(function (p) {
              p.fullySelected = true;
            });
          }
        });
      }
    }
  };

  paper.view.onFrame = function (e) {
    frameCount++;
    littleCanvases.forEach(function (c) {
      if (isDrawingMode) {
        if (c.isDrawingDone) {
          c.mapValue(frameCount);
        }
      } else {
        c.time = 0;
      }
    });
  };
};
},{"./drawCanvas":"/Users/karen/Documents/my_project/tweak/drawCanvas.js"}]},{},["/Users/karen/Documents/my_project/tweak/test.js"]);
