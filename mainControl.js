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