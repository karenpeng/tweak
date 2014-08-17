paper.install(window);
var drawCanvas = document.getElementById('drawCanvas');
var beginX = 20;
var beginY = 40;
var endX = 640 - 20;
var endY = 480 - 40;
var interval = 6;
var radius = 20;
var isDrawingDone = false;
var value;

function constrain(item, min, max) {
  if (item < min) return min;
  else if (item > max) return max;
  else return item;
}
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
  var drawArea = new Path.Rectangle(0, 0, 640, 480);
  drawArea.strokeColor = 'black';

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
        path.add(new Point(beginX, beginY));
      }
    } else {
      //isDrawingDone = false;
      segment = null;
      //path = null;
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
        //path = hitResult.item;
        if (hitResult.type === 'segment') {

          segment = hitResult.segment;
          //segment.point.x = x;

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
      if (drawArea.bounds.contains(e.point)) {
        path.segments.forEach(function (s, index) {
          if (s.point.x >= e.point.x) {
            path.removeSegment(index);
          }

        })
        path.add(e.point);
        if (endP.bounds.contains(e.point)) {
          endP.fillColor = "pink";
        }
      }
    } else if (segment) {
      //console.log(segment.point.x+ " with" + e.delta.x)
      var index = segment.index;
      segment.point.x += e.delta.x;
      segment.point.x = constrain(segment.point.x, path.segments[
          index - 1].point.x + 0.0000001, path.segments[index + 1].point.x -
        0.000001)
      segment.point.y += e.delta.y;
      path.smooth();
    } else if (path) {
      //console.log(path)
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
      path.firstSegment.point = new Point(beginX, beginY);
      path.lastSegment.point.x = endX;
      path.lastSegment.point.y = endY;
      // paths.push(path);
      isDrawingDone = true;
      //console.log(value)
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
    //verticalPath.strokeColor = 'black';
    verticalPaths.push(verticalPath);
  }
  //gatting value
  function getValue() {

    value = [];
    verticalPaths.forEach(function (pa) {
      var intersections = path.getIntersections(pa);
      intersections.forEach(function (intersection) {
        //console.log(j, intersection.point)
        value.push([intersection.point.x, intersection.point.y])
      })
    })
    //return value;
  }
  //TODO:
  //0.add begin and end point

  //1.hooking up for use, css3!!!!

  //2.browserify! T T  T T

  //3.i think it should involves live coding, the code control all the canvas

  //4.generative design? Or just a ball?
  var boo = new Path.Circle(new Point(640 * 1.5, beginY), radius);
  boo.fillColor = 'pink';

  var time = 0;
  //var view = new View();
  var frameCount = 0;

  view.onFrame = function (e) {
    frameCount++;
    //if (frameCount % 2 === 0) {
    if (isDrawingDone) {
      getValue();
      //console.log(value)
      boo.position.y = value[time][1];
      //console.log(boo.position.y)
      time++;
      if (time >= value.length) time = 0;
    }
    //}
  }

}

window.onload = function () {
  whatever();
}