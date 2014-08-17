paper.install(window);
var drawCanvas = document.getElementById('drawCanvas');
var beginX = 20;
var beginY = 40;
var endX = 640 - 20;
var endY = 480 - 40;
var interval = 20;
var radius = 20;

//making a path
//window.onload = function () {
function whatever() {
  var path;
  //var paths = [];
  //TODO: paper is weird, it seems have done something on the canvas
  paper.setup('drawCanvas');
  //var width = drawCanvas.width;
  //var height = drawCanvas.height;
  //console.log(width, height)
  var tool = new Tool();

  var segment;
  var hitOptions = {
    segments: true,
    stroke: true,
    fill: false,
    tolerance: 5
  };

  var beginP = new Path.Circle(new Point(20, 40), radius);
  var endP = new Path.Circle(new Point(640 - 20, 480 - 40),
    radius);
  beginP.strokeColor = 'black';
  endP.strokeColor = 'black';

  tool.onMouseDown = function (e) {
    if (isDrawingMode) {
      if (beginP.bounds.contains(e.point)) {
        beginP.fillColor = 'blue';
        path = new Path();
        path.strokeColor = {
          gradient: {
            stops: ['blue', 'red', 'pink']
          },
          origin: [0, 0],
          destination: [640, 0]
        };
        path.strokeWidth = 15;
      }
    } else {
      segment = null;
      path = null;
      var hitResult = project.hitTest(e.point, hitOptions);
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
        path = hitResult.item;
        if (hitResult.type === 'segment') {
          segment = hitResult.segment;
        } else if (hitResult.type === 'stroke') {
          var location = hitResult.location;
          segment = path.insert(location.index + 1, e.point);
          path.smooth();
        }
      }
    }
  };

  tool.onMouseDrag = function (e) {
    if (isDrawingMode) {
      //if (drawArea.bounds.contains(e.point)) {
      path.segments.forEach(function (s, index) {
        if (s.point.x >= e.point.x) {
          path.removeSegment(index);
        }

      })
      path.add(e.point);
      if (endP.bounds.contains(e.point)) {
        endP.fillColor = "pink";
      }
      // }
    } else if (segment) {
      //console.log(segment.point.x+ " with" + e.delta.x)
      segment.point.x += e.delta.x;
      segment.point.y += e.delta.y;
      path.smooth();
    } else if (path) {
      console.log(path)
      path.position += e.delta;
    }
  };

  tool.onMouseUp = function (e) {
    if (isDrawingMode) {
      if (!endP.bounds.contains(e.point)) {
        path.add(new Point(endX, endY));
      }
      endP.fillColor = 'pink';
      path.smooth();
      path.simplify();
      // paths.push(path);
      var value = getValue()
      console.log(value)
      // createAnime(function () {
      //   moveBall(value);
      // });
    }
  };

  tool.onMouseMove = function (e) {
    if (isDrawingMode) {

    } else {
      project.activeLayer.selected = false;
      if (e.item) {
        e.item.selected = true;
      }
    }
  };

  //making vertival x path
  var verticalPaths = [];
  for (var i = beginX; i <= endX; i += interval) {
    var verticalPath = new Path.Line(new Point(i, beginY), new Point(i, endY));
    verticalPath.strokeColor = 'black';
    verticalPaths.push(verticalPath);
  }
  //gatting value
  function getValue() {

    // var curvePoints = [];
    // for (var i = 0; i < pathP.curves.length; i++) {
    //   var curve = pathP.curves[i];
    //   var interval = 10;
    //   //console.log(curve.length)
    //   for (var j = 1; j <= curve.length; j += interval) {
    //     var curvePosition = curve.getLocationAt(j / curve.length);
    //     //console.log(curvePosition.point.x, curvePosition.point.y)
    //     curvePoints.push([curvePosition.point.x, curvePosition.point.y]);
    //   }
    // }
    var j = 0;
    var value = [];
    verticalPaths.forEach(function (pa) {
      var intersections = path.getIntersections(pa);
      intersections.forEach(function (intersection) {
        console.log(j, intersection.point)
        j++
        value.push([intersection.point.x, intersection.point.y])
      })
    })
    return value;
  }
  //TODO:
  //0.add begin and end point

  //1.hooking up for use, css3!!!!

  //2.browserify! T T  T T

  //3.i think it should involves live coding, the code control all the canvas

  //4.generative design? Or just a ball?

  tool.onKeyDown = function (e) {
    //var value = getValue(path)
    //moveBall(value);
    //console.log(value)
  }
}

window.onload = function () {
  whatever();
}

var animiCanvas = document.getElementById('animiCanvas');
var animiCtx = animiCanvas.getContext("2d");
var boo = new Ball(640 / 2, beginY, 640 / 2, endY);

function map(para, orMin, orMax, tarMin, tarMax) {
  var ratio = (para - orMin) / (orMax - orMin);
  var tarValue = ratio * (tarMax - tarMin) + tarMin;
  return tarValue;
}

function Ball(beginX, beginY, endX, endY) {
  this.x = beginX;
  this.y = beginY;
  this.beginX = beginX;
  this.beginY = beginY;
  this.endX = endX;
  this.endY = endY;
}
Ball.prototype.draw = function () {
  animiCtx.beginPath();
  animiCtx.arc(this.x, this.y, 40, 0, Math.PI * 2);
  animiCtx.fillStyle = "#ddbb00";
  animiCtx.fill();
};

var i = 0;

function moveBall(value) {
  // value.forEach(function (point, index) {

  // });
  var moveHeight = endY - beginY;
  ball.y = value[i].y;
  i++;
  if (i > value.length) i = 0;
  ball.draw();
}

function createAnime(callback) {
  requestAnimationFrame(function () {
    createAnime(callback);
  });
  callback();
}
//};