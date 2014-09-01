paper.setup(myCanvas);

var LittleCanvas = require('./drawCanvas');
var littleCanvases = [];
var CodeMirror = require('codemirror');

// var myCodeMirror = CodeMirror(document.body, {
//   value: "function myScript(){return 100;}\n",
//   mode: "javascript"
// });

window.onload = function () {

  for (var itr = 0; itr < 3; itr++) {
    littleCanvases[itr] = new LittleCanvas(itr * 340 + 20, 40);
  }
  var tool = new paper.Tool();
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
      if (isDrawingMode) {
        c.time = 0;
      }
    });
  };

  tool.onMouseMove = function (e) {
    if (!isDrawingMode) {
      paper.project.activeLayer.selected = false;
      if (e.item) {
        e.item.selected = true;
      }
    }
  };

  paper.view.onFrame = function (e) {
    frameCount++;
    if (frameCount % 6 === 0) {
      littleCanvases.forEach(function (c) {
        if (isDrawingMode) {
          if (c.isDrawingDone) {
            c.getValue();
            c.mapValue();
          }
        } else {
          c.time = 0;
        }
      });
    }
  };
};