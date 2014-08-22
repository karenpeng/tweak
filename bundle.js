(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/karen/Documents/my_project/tweak/can.js":[function(require,module,exports){
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
},{}],"/Users/karen/Documents/my_project/tweak/test.js":[function(require,module,exports){
//var watchify = require('watchify');
var can = require("./can");

//paper.install(window);
//var i = 0; window.onload = function () {
var canvasGroup = document.getElementById('canvasGroup');
for (var itr = 0; itr < 4; itr++) {
  can(canvasGroup, itr * 320);
}

// var canvasGroup = document.getElementById('canvasGroup');
// var drawCanvas = document.createElement('canvas');
// drawCanvas.setAttribute('id', 'drawCanvas' + 0);
// canvasGroup.appendChild(drawCanvas);
},{"./can":"/Users/karen/Documents/my_project/tweak/can.js"}]},{},["/Users/karen/Documents/my_project/tweak/test.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2thcmVuL0RvY3VtZW50cy9teV9wcm9qZWN0L3R3ZWFrL2Nhbi5qcyIsIi9Vc2Vycy9rYXJlbi9Eb2N1bWVudHMvbXlfcHJvamVjdC90d2Vhay90ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjYW52YXNHcm91cCwgaXRyKSB7XG5cbiAgdmFyIGRyYXdDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgZHJhd0NhbnZhcy5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2RyYXdDYW52YXMnICsgaXRyKTtcbiAgZHJhd0NhbnZhcy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsICcyMDBweCcpO1xuICBkcmF3Q2FudmFzLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAncGFkZGluZzo1cHg7IG1hcmdpbjowOycpO1xuICBjYW52YXNHcm91cC5hcHBlbmRDaGlsZChkcmF3Q2FudmFzKTtcblxuICB2YXIgY2FudmFzSWQgPSAnZHJhd0NhbnZhcycgKyBpdHI7XG4gIHBhcGVyLnNldHVwKGNhbnZhc0lkKTtcbiAgLy9jb25zb2xlLmxvZyhwYXBlci5wcm9qZWN0cylcblxuICB3aXRoKHBhcGVyKSB7XG4gICAgdmFyIHdpZHRoID0gMjgwO1xuICAgIHZhciBoZWlnaHQgPSAyMDA7XG4gICAgdmFyIHJhZGl1cyA9IDEwO1xuICAgIHZhciBiZWdpblggPSByYWRpdXM7XG4gICAgdmFyIGJlZ2luWSA9IHJhZGl1cztcbiAgICB2YXIgZW5kWCA9IHdpZHRoIC0gcmFkaXVzO1xuICAgIHZhciBlbmRZID0gaGVpZ2h0IC0gcmFkaXVzO1xuICAgIHZhciBpbnRlcnZhbCA9IDY7XG4gICAgdmFyIHRpbWUgPSAwO1xuICAgIHZhciBpc0RyYXdpbmdEb25lcyA9IFtdO1xuICAgIGlzRHJhd2luZ0RvbmVzW2l0cl0gPSBmYWxzZTtcbiAgICB2YXIgcGF0aDtcbiAgICB2YXIgdG9vbHMgPSBbXTtcbiAgICB0b29sc1tpdHJdID0gbmV3IHBhcGVyLlRvb2woKTtcblxuICAgIGZ1bmN0aW9uIGNvbnN0cmFpbihpdGVtLCBtaW4sIG1heCkge1xuICAgICAgaWYgKGl0ZW0gPCBtaW4pIHJldHVybiBtaW47XG4gICAgICBlbHNlIGlmIChpdGVtID4gbWF4KSByZXR1cm4gbWF4O1xuICAgICAgZWxzZSByZXR1cm4gaXRlbTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXAocGFyYSwgb3JNaW4sIG9yTWF4LCB0YXJNaW4sIHRhck1heCkge1xuICAgICAgdmFyIHJhdGlvID0gKHBhcmEgLSBvck1pbikgLyAob3JNYXggLSBvck1pbik7XG4gICAgICB2YXIgdGFyVmFsdWUgPSByYXRpbyAqICh0YXJNYXggLSB0YXJNaW4pICsgdGFyTWluO1xuICAgICAgcmV0dXJuIHRhclZhbHVlO1xuICAgIH1cblxuICAgIC8vbWFraW5nIGJlZ2luIGFuZCBlbmQgcG9pbnRcbiAgICB2YXIgYmVnaW5QID0gbmV3IHBhcGVyLlBhdGguQ2lyY2xlKG5ldyBwYXBlci5Qb2ludChiZWdpblgsIGJlZ2luWSksIHJhZGl1cyk7XG4gICAgdmFyIGVuZFAgPSBuZXcgcGFwZXIuUGF0aC5DaXJjbGUobmV3IHBhcGVyLlBvaW50KGVuZFgsIGVuZFkpLCByYWRpdXMpO1xuICAgIGJlZ2luUC5zdHJva2VDb2xvciA9ICdibGFjayc7XG4gICAgZW5kUC5zdHJva2VDb2xvciA9ICdibGFjayc7XG5cbiAgICAvL21ha2luZyBkcmF3IGFyZWFcbiAgICB2YXIgZHJhd0FyZWEgPSBuZXcgcGFwZXIuUGF0aC5SZWN0YW5nbGUoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgZHJhd0FyZWEuc3Ryb2tlQ29sb3IgPSAnYmxhY2snO1xuXG4gICAgLy9tYWtpbmcgaW50ZXJ2YWwgeCBwYXRoXG4gICAgdmFyIHZlcnRpY2FsUGF0aHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gYmVnaW5YOyBpIDw9IGVuZFg7IGkgKz0gaW50ZXJ2YWwpIHtcbiAgICAgIHZhciB2ZXJ0aWNhbFBhdGggPSBuZXcgcGFwZXIuUGF0aC5MaW5lKG5ldyBwYXBlci5Qb2ludChpLCAwKSwgbmV3IHBhcGVyLlBvaW50KFxuICAgICAgICBpLCBoZWlnaHQpKTtcbiAgICAgIC8vdmVydGljYWxQYXRoLnN0cm9rZUNvbG9yID0gJ2JsYWNrJztcbiAgICAgIHZlcnRpY2FsUGF0aHMucHVzaCh2ZXJ0aWNhbFBhdGgpO1xuICAgIH1cblxuICAgIC8vbWFraW5nIG1vdmluZyBiYWxsXG4gICAgdmFyIGJvbyA9IG5ldyBwYXBlci5QYXRoLkNpcmNsZShuZXcgcGFwZXIuUG9pbnQod2lkdGggKyByYWRpdXMsIGJlZ2luWSksXG4gICAgICByYWRpdXMpO1xuICAgIGJvby5maWxsQ29sb3IgPSAnYmx1ZSc7XG5cbiAgICBmdW5jdGlvbiBnZXRWYWx1ZSgpIHtcbiAgICAgIHZhciB2YWx1ZSA9IFtdO1xuICAgICAgdmVydGljYWxQYXRocy5mb3JFYWNoKGZ1bmN0aW9uIChwYSkge1xuICAgICAgICB2YXIgaW50ZXJzZWN0aW9ucyA9IHBhdGguZ2V0SW50ZXJzZWN0aW9ucyhwYSk7XG4gICAgICAgIGludGVyc2VjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoaW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgdmFsdWUucHVzaChbaW50ZXJzZWN0aW9uLnBvaW50LngsIGludGVyc2VjdGlvbi5wb2ludC55XSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgdmFyIGhpdFNlZ21lbnQ7XG4gICAgdmFyIGhpdE9wdGlvbnMgPSB7XG4gICAgICBzZWdtZW50czogdHJ1ZSxcbiAgICAgIHN0cm9rZTogdHJ1ZSxcbiAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgdG9sZXJhbmNlOiA1XG4gICAgfTtcblxuICAgIHRvb2xzW2l0cl0ub25Nb3VzZURvd24gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgaWYgKGlzRHJhd2luZ01vZGUpIHtcbiAgICAgICAgaWYgKGJlZ2luUC5ib3VuZHMuY29udGFpbnMoZS5wb2ludCkpIHtcbiAgICAgICAgICBiZWdpblAuZmlsbENvbG9yID0gJ2JsdWUnO1xuICAgICAgICAgIHBhdGggPSBuZXcgcGFwZXIuUGF0aCgpO1xuICAgICAgICAgIHBhdGguc3Ryb2tlQ29sb3IgPSB7XG4gICAgICAgICAgICBncmFkaWVudDoge1xuICAgICAgICAgICAgICBzdG9wczogWydibHVlJywgJ2dyZWVuJywgJ3llbGxvdyddXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb3JpZ2luOiBbMCwgMF0sXG4gICAgICAgICAgICBkZXN0aW5hdGlvbjogW3dpZHRoLCAwXVxuICAgICAgICAgIH07XG4gICAgICAgICAgcGF0aC5zdHJva2VXaWR0aCA9IDg7XG4gICAgICAgICAgcGF0aC5hZGQobmV3IHBhcGVyLlBvaW50KGJlZ2luWCwgYmVnaW5ZKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhpdFNlZ21lbnQgPSBudWxsO1xuICAgICAgICB2YXIgaGl0UmVzdWx0ID0gcGFwZXIucHJvamVjdC5oaXRUZXN0KGUucG9pbnQsIGhpdE9wdGlvbnMpO1xuICAgICAgICBpZiAoIWhpdFJlc3VsdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZS5tb2RpZmllcnMuc2hpZnQpIHtcbiAgICAgICAgICBpZiAoaGl0UmVzdWx0LnR5cGUgPT09ICdzZWdtZW50Jykge1xuICAgICAgICAgICAgaGl0UmVzdWx0LnNlZ21lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgICAgaWYgKGhpdFJlc3VsdC50eXBlID09PSAnc2VnbWVudCcpIHtcbiAgICAgICAgICAgIGhpdFNlZ21lbnQgPSBoaXRSZXN1bHQuc2VnbWVudDtcbiAgICAgICAgICB9IGVsc2UgaWYgKGhpdFJlc3VsdC50eXBlID09PSAnc3Ryb2tlJykge1xuICAgICAgICAgICAgdmFyIGxvY2F0aW9uID0gaGl0UmVzdWx0LmxvY2F0aW9uO1xuICAgICAgICAgICAgaGl0U2VnbWVudCA9IHBhdGguaW5zZXJ0KGxvY2F0aW9uLmluZGV4ICsgMSwgZS5wb2ludCk7XG4gICAgICAgICAgICBwYXRoLnNtb290aCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB0b29sc1tpdHJdLm9uTW91c2VEcmFnID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmIChpc0RyYXdpbmdNb2RlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGUucG9pbnQueCwgZS5wb2ludC55KVxuICAgICAgICBpZiAoZHJhd0FyZWEuYm91bmRzLmNvbnRhaW5zKGUucG9pbnQpKSB7XG4gICAgICAgICAgcGF0aC5zZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChzLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKHMucG9pbnQueCA+PSBlLnBvaW50LngpIHtcbiAgICAgICAgICAgICAgcGF0aC5yZW1vdmVTZWdtZW50KGluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwYXRoLmFkZChlLnBvaW50KTtcbiAgICAgICAgICBpZiAoZW5kUC5ib3VuZHMuY29udGFpbnMoZS5wb2ludCkpIHtcbiAgICAgICAgICAgIGVuZFAuZmlsbENvbG9yID0gXCJ5ZWxsb3dcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaGl0U2VnbWVudCkge1xuICAgICAgICB2YXIgaW5kZXggPSBoaXRTZWdtZW50LmluZGV4O1xuICAgICAgICBoaXRTZWdtZW50LnBvaW50LnggKz0gZS5kZWx0YS54O1xuICAgICAgICBoaXRTZWdtZW50LnBvaW50LnggPSBjb25zdHJhaW4oaGl0U2VnbWVudC5wb2ludC54LCBwYXRoLnNlZ21lbnRzW1xuICAgICAgICAgICAgaW5kZXggLSAxXS5wb2ludC54ICsgMC4wMDAwMDAxLCBwYXRoLnNlZ21lbnRzW2luZGV4ICsgMV0ucG9pbnQueCAtXG4gICAgICAgICAgMC4wMDAwMDAxKTtcbiAgICAgICAgaGl0U2VnbWVudC5wb2ludC55ICs9IGUuZGVsdGEueTtcbiAgICAgICAgcGF0aC5zbW9vdGgoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdG9vbHNbaXRyXS5vbk1vdXNlVXAgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgaWYgKGlzRHJhd2luZ01vZGUpIHtcbiAgICAgICAgaWYgKCFlbmRQLmJvdW5kcy5jb250YWlucyhlLnBvaW50KSkge1xuICAgICAgICAgIHBhdGguYWRkKG5ldyBwYXBlci5Qb2ludChlbmRYLCBlbmRZKSk7XG4gICAgICAgIH1cbiAgICAgICAgZW5kUC5maWxsQ29sb3IgPSAneWVsbG93JztcbiAgICAgICAgcGF0aC5zbW9vdGgoKTtcbiAgICAgICAgcGF0aC5zaW1wbGlmeSgpO1xuICAgICAgICBwYXRoLmZpcnN0U2VnbWVudC5wb2ludC54ID0gYmVnaW5YO1xuICAgICAgICBwYXRoLmZpcnN0U2VnbWVudC5wb2ludC55ID0gYmVnaW5ZO1xuICAgICAgICBwYXRoLmxhc3RTZWdtZW50LnBvaW50LnggPSBlbmRYO1xuICAgICAgICBwYXRoLmxhc3RTZWdtZW50LnBvaW50LnkgPSBlbmRZO1xuICAgICAgICBpc0RyYXdpbmdEb25lc1tpdHJdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdG9vbHNbaXRyXS5vbk1vdXNlTW92ZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAoIWlzRHJhd2luZ01vZGUpIHtcbiAgICAgICAgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICBpZiAoZS5pdGVtKSB7XG4gICAgICAgICAgZS5pdGVtLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICAvL1RPRE86XG5cbiAgICAvLzEuaG9va2luZyB1cCBmb3IgdXNlLCBjc3MzISEhIVxuXG4gICAgLy8zLmkgdGhpbmsgaXQgc2hvdWxkIGludm9sdmVzIGxpdmUgY29kaW5nLCB0aGUgY29kZSBjb250cm9sIGFsbCB0aGUgY2FudmFzXG5cbiAgICAvLzQuZ2VuZXJhdGl2ZSBkZXNpZ24/IE9yIGp1c3QgYSBiYWxsP1xuXG4gICAgcGFwZXIudmlldy5vbkZyYW1lID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmIChpc0RyYXdpbmdEb25lc1tpdHJdKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGdldFZhbHVlKCk7XG4gICAgICAgIGJvby5wb3NpdGlvbi55ID0gdmFsdWVbdGltZV1bMV07XG4gICAgICAgIGJvby5maWxsQ29sb3IuaHVlID0gbWFwKGJvby5wb3NpdGlvbi55LCBiZWdpblksIGVuZFksIDI0MCwgNjApO1xuICAgICAgICB0aW1lKys7XG4gICAgICAgIGlmICh0aW1lID49IHZhbHVlLmxlbmd0aCkgdGltZSA9IDA7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICAvLyAgd2hhdGV2ZXIoKTtcblxuICAvL2NvbnNvbGUubG9nKHBhcGVyU2Nyb3BlLnByb2plY3QpXG59IiwiLy92YXIgd2F0Y2hpZnkgPSByZXF1aXJlKCd3YXRjaGlmeScpO1xudmFyIGNhbiA9IHJlcXVpcmUoXCIuL2NhblwiKTtcblxuLy9wYXBlci5pbnN0YWxsKHdpbmRvdyk7XG4vL3ZhciBpID0gMDsgd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbnZhciBjYW52YXNHcm91cCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNHcm91cCcpO1xuZm9yICh2YXIgaXRyID0gMDsgaXRyIDwgNDsgaXRyKyspIHtcbiAgY2FuKGNhbnZhc0dyb3VwLCBpdHIgKiAzMjApO1xufVxuXG4vLyB2YXIgY2FudmFzR3JvdXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzR3JvdXAnKTtcbi8vIHZhciBkcmF3Q2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4vLyBkcmF3Q2FudmFzLnNldEF0dHJpYnV0ZSgnaWQnLCAnZHJhd0NhbnZhcycgKyAwKTtcbi8vIGNhbnZhc0dyb3VwLmFwcGVuZENoaWxkKGRyYXdDYW52YXMpOyJdfQ==
