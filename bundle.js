(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/karen/Documents/my_project/tweak/constrain.js":[function(require,module,exports){
module.exports = function (item, min, max) {
  if (item < min) return min;
  else if (item > max) return max;
  else return item;
};
},{}],"/Users/karen/Documents/my_project/tweak/drawCanvas.js":[function(require,module,exports){
// var drawCanvas = document.createElement('canvas');
// drawCanvas.setAttribute('id', 'drawCanvas' + itr);
// drawCanvas.setAttribute('height', '200px');
// drawCanvas.setAttribute('style', 'padding:5px; margin:0;');
// canvasGroup.appendChild(drawCanvas);

// var canvasId = 'drawCanvas' + itr;
// paper.setup(canvasId);
//console.log(paper.projects)

//with(paper) {

function littleCanvas(beginPointX, beginPointY, map, constrain) {
  this.width = 320;
  this.height = 240;
  this.radius = 5;
  this.beginX = beginPointX + this.radius;
  this.beginY = beginPointY + this.radius;
  this.endX = beginPointX + this.width - this.radius;
  this.endY = beginPointY + this.height - this.radius;
  this.interval = 6;
  this.time = 0;
  this.isDrawingDone = false;

  //making begin and end point
  this.beginP = new paper.Path.Circle(this.beginX, this.beginY, this.radius);
  this.endP = new paper.Path.Circle(this.endX, this.endY, this.radius);
  this.beginP.strokeColor = 'black';
  this.endP.strokeColor = 'black';

  //making draw area
  this.drawArea = new paper.Path.Rectangle(this.beginPointX, this.beginPointY,
    this.width,
    this.height);
  this.drawArea.strokeColor = 'black';

  //making interval x path
  this.verticalPaths = [];
  for (var i = this.beginX; i <= this.endX; i += this.interval) {
    var verticalPath = new paper.Path.Line(new paper.Point(i, 0), new paper
      .Point(
        i, this.height));
    //verticalPath.strokeColor = 'black';
    this.verticalPaths.push(verticalPath);
  }

  //making moving ball
  this.boo = new paper.Path.Circle(this.beginPointX + this.width + this.radius,
    this.beginY,
    this.radius);
  this.boo.fillColor = 'blue';

  //set hitOptions for edite
  this.hitOptions = {
    segments: true,
    stroke: true,
    fill: false,
    tolerance: 5
  };
}

littleCanvas.prototype.onMouseDown = function (e) {
  if (isDrawingMode) {
    if (this.beginP.bounds.contains(e.point)) {
      this.beginP.fillColor = 'blue';
      this.path = new paper.Path();
      this.path.strokeColor = {
        gradient: {
          stops: ['blue', 'green', 'yellow']
        },
        origin: [0, 0],
        destination: [this.width, 0]
      };
      this.path.strokeWidth = 8;
      this.path.add(new paper.Point(this.beginX, this.beginY));
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
    if (hitResult) {
      if (hitResult.type === 'segment') {
        this.hitSegment = hitResult.segment;
      } else if (hitResult.type === 'stroke') {
        var location = hitResult.location;
        this.hitSegment = this.path.insert(location.index + 1, e.point);
        this.path.smooth();
      }
    }
  }
};

littleCanvas.prototype.onMouseDrag = function (e) {
  if (isDrawingMode) {
    if (this.drawArea.bounds.contains(e.point)) {
      this.path.segments.forEach(function (s, index) {
        if (s.point.x >= e.point.x) {
          this.path.removeSegment(index);
        }
      });
      this.path.add(e.point);
      if (this.endP.bounds.contains(e.point)) {
        this.endP.fillColor = "yellow";
      }
    }
  } else if (this.hitSegment) {
    var index = this.hitSegment.index;
    this.hitSegment.point.x += e.delta.x;
    this.hitSegment.point.x = constrain(this.hitSegment.point.x, this.path.segments[
        index - 1].point.x + 0.0000001, this.path.segments[index + 1].point.x -
      0.0000001);
    this.hitSegment.point.y += e.delta.y;
    this.path.smooth();
  }
};

littleCanvas.prototype.onMouseUp = function (e) {
  if (isDrawingMode) {
    if (!this.endP.bounds.contains(e.point)) {
      this.path.add(new paper.Point(this.endX, this.endY));
    }
    this.endP.fillColor = 'yellow';
    this.path.smooth();
    this.path.simplify();
    this.path.firstSegment.point.x = beginX;
    this.path.firstSegment.point.y = beginY;
    this.path.lastSegment.point.x = endX;
    this.path.lastSegment.point.y = endY;
    this.isDrawingDone = true;
  }
};

littleCanvas.prototype.onMouseMove = function (e) {
  if (!isDrawingMode) {
    paper.project.activeLayer.selected = false;
    if (e.item) {
      e.item.selected = true;
    }
  }
};

littleCanvas.prototype.getValue = function () {
  this.value = [];
  this.verticalPaths.forEach(function (pa) {
    var intersections = this.path.getIntersections(pa);
    intersections.forEach(function (intersection) {
      this.value.push([intersection.point.x, intersection.point.y]);
    });
  });
};

littleCanvas.prototype.mapValue = function () {
  this.boo.position.y = this.value[time][1];
  this.boo.fillColor.hue = map(this.boo.position.y, this.beginY, this.endY, 240,
    60);
  this.time++;
  if (this.time >= this.value.length) this.time = 0;
};

//TODO:

//1.hooking up for use, css3!!!!

//3.i think it should involves live coding, the code control all the canvas

//4.generative design? Or just a ball?

//  }
//  whatever();

//console.log(paperScrope.project)
module.exports = littleCanvas;
},{}],"/Users/karen/Documents/my_project/tweak/mainControl.js":[function(require,module,exports){
function mainControl(littleCanvases) {

  //get value by counting intersection with perpendicular paths
  var tool = new paper.Tool();

  tool.onMouseDrag = function (e) {
    littleCanvases.forEach(function (c) {
      c.onMouseDrag(e);
    });
  };

  tool.onMouseYp = function (e) {
    littleCanvases.forEach(function (c) {
      c.onMouseUp(e);
    });
  };

  tool.onMouseUp = function (e) {
    littleCanvases.forEach(function (c) {
      c.onMouseUp(e);
    });
  };

  paper.view.onFrame = function (e) {
    if (isDrawingMode) {
      littleCanvases.forEach(function (c) {
        if (c.isDrawingDone) {
          c.getValue();
          c.mapValue();
        }
      });
    } else {
      c.time = 0;
    }
  };
}

module.exports = mainControl;
},{}],"/Users/karen/Documents/my_project/tweak/map.js":[function(require,module,exports){
 module.exports = function (para, orMin, orMax, tarMin, tarMax) {
   var ratio = (para - orMin) / (orMax - orMin);
   var tarValue = ratio * (tarMax - tarMin) + tarMin;
   return tarValue;
 };
},{}],"/Users/karen/Documents/my_project/tweak/test.js":[function(require,module,exports){
//var watchify = require('watchify');
//var can = require("./can");
var myCanvas = document.getElementById('myCanvas');
paper.setup(myCanvas);
//paper.install(window);
//var i = 0; window.onload = function () {
// var canvasGroup = document.getElementById('canvasGroup');
//with(paper){

var map = require('./map');
var constrain = require('./constrain');
var drawCanvas = require('./drawCanvas');
var mainControl = require('./mainControl');
var littleCanvases = [];

window.onload = function () {
  for (var itr = 0; itr < 2; itr++) {
    //can(itr * 340 + 20, 40);
    littleCanvases[itr] = new drawCanvas(itr * 340 + 20, 40, map, constrain);
  }
  var main = new mainControl(littleCanvases);
};
//}

// var canvasGroup = document.getElementById('canvasGroup');
// var drawCanvas = document.createElement('canvas');
// drawCanvas.setAttribute('id', 'drawCanvas' + 0);
// canvasGroup.appendChild(drawCanvas);

//MVC???
},{"./constrain":"/Users/karen/Documents/my_project/tweak/constrain.js","./drawCanvas":"/Users/karen/Documents/my_project/tweak/drawCanvas.js","./mainControl":"/Users/karen/Documents/my_project/tweak/mainControl.js","./map":"/Users/karen/Documents/my_project/tweak/map.js"}]},{},["/Users/karen/Documents/my_project/tweak/test.js"]);
