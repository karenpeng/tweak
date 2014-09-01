module.exports = function (beginPointX, beginPointY) {

  // var drawCanvas = document.createElement('canvas');
  // drawCanvas.setAttribute('id', 'drawCanvas' + itr);
  // drawCanvas.setAttribute('height', '200px');
  // drawCanvas.setAttribute('style', 'padding:5px; margin:0;');
  // canvasGroup.appendChild(drawCanvas);

  // var canvasId = 'drawCanvas' + itr;
  // paper.setup(canvasId);
  //console.log(paper.projects)

  //with(paper) {
  var map = require('./map');
  var constrain = require('./constrain');

  function littleCanvas() {
    var width = 320;
    var height = 240;
    var radius = 5;
    var beginX = beginPointX + radius;
    var beginY = beginPointY + radius;
    var endX = beginPointX + width - radius;
    var endY = beginPointY + height - radius;
    var interval = 6;
    var time = 0;
    var isDrawingDone = false;
    var path;
    var hitSegment;
    var tool = new paper.Tool();

    //making begin and end point
    var beginP = new paper.Path.Circle(new paper.Point(beginX, beginY),
      radius);
    var endP = new paper.Path.Circle(new paper.Point(endX, endY), radius);
    beginP.strokeColor = 'black';
    endP.strokeColor = 'black';

    //making draw area
    var drawArea = new paper.Path.Rectangle(beginPointX, beginPointY, width,
      height);
    drawArea.strokeColor = 'black';

    //making interval x path
    var verticalPaths = [];
    for (var i = beginX; i <= endX; i += interval) {
      var verticalPath = new paper.Path.Line(new paper.Point(i, 0), new paper
        .Point(
          i, height));
      //verticalPath.strokeColor = 'black';
      verticalPaths.push(verticalPath);
    }

    //making moving ball
    var boo = new paper.Path.Circle(beginPointX + width + radius, beginY,
      radius);
    boo.fillColor = 'blue';

    //set hitOptions for edite
    var hitOptions = {
      segments: true,
      stroke: true,
      fill: false,
      tolerance: 5
    };

    //get value by counting intersection with perpendicular paths
    function getValue() {
      var value = [];
      verticalPaths.forEach(function (pa) {
        var intersections = paths[itr].getIntersections(pa);
        intersections.forEach(function (intersection) {
          value.push([intersection.point.x, intersection.point.y]);
        });
      });
      return value;
    }

    << << << < HEAD
    var hitSegment;
    var hitOptions = {
      segments: true,
      stroke: true,
      fill: false,
      tolerance: 5
    };

    tools[itr].onMouseDown = function (e) {
      console.log(itr) === === =
        tool.onMouseDown = function (e) { >>> >>> > master
          if (isDrawingMode) {
            if (beginP.bounds.contains(e.point)) {
              beginP.fillColor = 'blue';
              //path = new paper.Path();
              paths[itr].strokeColor = {
                gradient: {
                  stops: ['blue', 'green', 'yellow']
                },
                origin: [0, 0],
                destination: [width, 0]
              };
              paths[itr].strokeWidth = 8;
              paths[itr].add(new paper.Point(beginX, beginY));
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
                hitSegment = paths[itr].insert(location.index + 1, e.point);
                paths[itr].smooth();
              }
            }
          }
      };

      tool.onMouseDrag = function (e) {
        if (isDrawingMode) {
          if (drawArea.bounds.contains(e.point)) {
            paths[itr].segments.forEach(function (s, index) {
              if (s.point.x >= e.point.x) {
                paths[itr].removeSegment(index);
              }
            });
            paths[itr].add(e.point);
            if (endP.bounds.contains(e.point)) {
              endP.fillColor = "yellow";
            }
          }
        } else if (hitSegment) {
          var index = hitSegment.index;
          hitSegment.point.x += e.delta.x;
          hitSegment.point.x = constrain(hitSegment.point.x, paths[itr].segments[
              index - 1].point.x + 0.0000001, paths[itr].segments[index + 1].point
            .x -
            0.0000001);
          hitSegment.point.y += e.delta.y;
          paths[itr].smooth();
        }
      };

      tool.onMouseUp = function (e) {
        if (isDrawingMode) {
          if (!endP.bounds.contains(e.point)) {
            paths[itr].add(new paper.Point(endX, endY));
          }
          endP.fillColor = 'yellow'; << << << < HEAD
          paths[itr].smooth();
          paths[itr].simplify();
          paths[itr].firstSegment.point.x = beginX;
          paths[itr].firstSegment.point.y = beginY;
          paths[itr].lastSegment.point.x = endX;
          paths[itr].lastSegment.point.y = endY;
          isDrawingDones[itr] = true; === === =
            path.smooth();
          path.simplify();
          path.firstSegment.point.x = beginX;
          path.firstSegment.point.y = beginY;
          path.lastSegment.point.x = endX;
          path.lastSegment.point.y = endY;
          isDrawingDone = true; >>> >>> > master
        }
      };

      tool.onMouseMove = function (e) {
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
        if (isDrawingDone) {
          var value = getValue();
          boo.position.y = value[time][1];
          boo.fillColor.hue = map(boo.position.y, beginY, endY, 240, 60);
          time++;
          if (time >= value.length) time = 0;
        }
      };
      //  }
      //  whatever();

      //console.log(paperScrope.project)
    }

    var l = new littleCanvas(beginPointX, beginPointY);
    return l;
  };