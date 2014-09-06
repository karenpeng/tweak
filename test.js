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