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