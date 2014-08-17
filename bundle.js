(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function (canvasGroup, itr) {

  var drawCanvas = document.createElement('canvas');
  drawCanvas.setAttribute('id', 'drawCanvas' + itr);
  drawCanvas.setAttribute('height', '200px');
  drawCanvas.setAttribute('style', 'padding:5px; margin:0;');
  canvasGroup.appendChild(drawCanvas);

  var canvasId = 'drawCanvas' + itr;
  paper.setup(canvasId);
  //console.log(paper.projects)

  with(paper) {
    var width = 280;
    var height = 200;
    var radius = 10;
    var beginX = radius;
    var beginY = radius;
    var endX = width - radius;
    var endY = height - radius;
    var interval = 6;
    var time = 0;
    var isDrawingDones = [];
    isDrawingDones[itr] = false;
    var path;
    var tools = [];
    tools[itr] = new paper.Tool();

    function constrain(item, min, max) {
      if (item < min) return min;
      else if (item > max) return max;
      else return item;
    }

    function map(para, orMin, orMax, tarMin, tarMax) {
      var ratio = (para - orMin) / (orMax - orMin);
      var tarValue = ratio * (tarMax - tarMin) + tarMin;
      return tarValue;
    }

    //making begin and end point
    var beginP = new paper.Path.Circle(new paper.Point(beginX, beginY), radius);
    var endP = new paper.Path.Circle(new paper.Point(endX, endY), radius);
    beginP.strokeColor = 'black';
    endP.strokeColor = 'black';

    //making draw area
    var drawArea = new paper.Path.Rectangle(0, 0, width, height);
    drawArea.strokeColor = 'black';

    //making interval x path
    var verticalPaths = [];
    for (var i = beginX; i <= endX; i += interval) {
      var verticalPath = new paper.Path.Line(new paper.Point(i, 0), new paper.Point(
        i, height));
      //verticalPath.strokeColor = 'black';
      verticalPaths.push(verticalPath);
    }

    //making moving ball
    var boo = new paper.Path.Circle(new paper.Point(width + radius, beginY),
      radius);
    boo.fillColor = 'blue';

    function getValue() {
      var value = [];
      verticalPaths.forEach(function (pa) {
        var intersections = path.getIntersections(pa);
        intersections.forEach(function (intersection) {
          value.push([intersection.point.x, intersection.point.y]);
        });
      });
      return value;
    }

    var hitSegment;
    var hitOptions = {
      segments: true,
      stroke: true,
      fill: false,
      tolerance: 5
    };

    tools[itr].onMouseDown = function (e) {
      if (isDrawingMode) {
        if (beginP.bounds.contains(e.point)) {
          beginP.fillColor = 'blue';
          path = new paper.Path();
          path.strokeColor = {
            gradient: {
              stops: ['blue', 'green', 'yellow']
            },
            origin: [0, 0],
            destination: [width, 0]
          };
          path.strokeWidth = 8;
          path.add(new paper.Point(beginX, beginY));
        }
      } else {
        hitSegment = null;
        var hitResult = paper.project.hitTest(e.point, hitOptions);
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
            hitSegment = hitResult.segment;
          } else if (hitResult.type === 'stroke') {
            var location = hitResult.location;
            hitSegment = path.insert(location.index + 1, e.point);
            path.smooth();
          }
        }
      }
    };

    tools[itr].onMouseDrag = function (e) {
      if (isDrawingMode) {
        console.log(e.point.x, e.point.y)
        if (drawArea.bounds.contains(e.point)) {
          path.segments.forEach(function (s, index) {
            if (s.point.x >= e.point.x) {
              path.removeSegment(index);
            }
          });
          path.add(e.point);
          if (endP.bounds.contains(e.point)) {
            endP.fillColor = "yellow";
          }
        }
      } else if (hitSegment) {
        var index = hitSegment.index;
        hitSegment.point.x += e.delta.x;
        hitSegment.point.x = constrain(hitSegment.point.x, path.segments[
            index - 1].point.x + 0.0000001, path.segments[index + 1].point.x -
          0.0000001);
        hitSegment.point.y += e.delta.y;
        path.smooth();
      }
    };

    tools[itr].onMouseUp = function (e) {
      if (isDrawingMode) {
        if (!endP.bounds.contains(e.point)) {
          path.add(new paper.Point(endX, endY));
        }
        endP.fillColor = 'yellow';
        path.smooth();
        path.simplify();
        path.firstSegment.point.x = beginX;
        path.firstSegment.point.y = beginY;
        path.lastSegment.point.x = endX;
        path.lastSegment.point.y = endY;
        isDrawingDones[itr] = true;
      }
    };

    tools[itr].onMouseMove = function (e) {
      if (!isDrawingMode) {
        paper.project.activeLayer.selected = false;
        if (e.item) {
          e.item.selected = true;
        }
      }
    };

    //TODO:

    //1.hooking up for use, css3!!!!

    //3.i think it should involves live coding, the code control all the canvas

    //4.generative design? Or just a ball?

    paper.view.onFrame = function (e) {
      if (isDrawingDones[itr]) {
        var value = getValue();
        boo.position.y = value[time][1];
        boo.fillColor.hue = map(boo.position.y, beginY, endY, 240, 60);
        time++;
        if (time >= value.length) time = 0;
      }
    };
  }
  //  whatever();

  //console.log(paperScrope.project)
}
},{}],2:[function(require,module,exports){
"use strict"

function unique_pred(list, compare) {
  var ptr = 1
    , len = list.length
    , a=list[0], b=list[0]
  for(var i=1; i<len; ++i) {
    b = a
    a = list[i]
    if(compare(a, b)) {
      if(i === ptr) {
        ptr++
        continue
      }
      list[ptr++] = a
    }
  }
  list.length = ptr
  return list
}

function unique_eq(list) {
  var ptr = 1
    , len = list.length
    , a=list[0], b = list[0]
  for(var i=1; i<len; ++i, b=a) {
    b = a
    a = list[i]
    if(a !== b) {
      if(i === ptr) {
        ptr++
        continue
      }
      list[ptr++] = a
    }
  }
  list.length = ptr
  return list
}

function unique(list, compare, sorted) {
  if(list.length === 0) {
    return list
  }
  if(compare) {
    if(!sorted) {
      list.sort(compare)
    }
    return unique_pred(list, compare)
  }
  if(!sorted) {
    list.sort()
  }
  return unique_eq(list)
}

module.exports = unique

},{}],3:[function(require,module,exports){
var uniq = require('uniq');
var can = require("./can");
//paper.install(window);
//var i = 0;
window.onload = function () {
  var canvasGroup = document.getElementById('canvasGroup');
  for (var itr = 0; itr < 4; itr++) {
    can(canvasGroup, itr * 320);
  }
}

// var canvasGroup = document.getElementById('canvasGroup');
// var drawCanvas = document.createElement('canvas');
// drawCanvas.setAttribute('id', 'drawCanvas' + 0);
// canvasGroup.appendChild(drawCanvas);
},{"./can":1,"uniq":2}]},{},[3]);
