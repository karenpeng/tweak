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
//var drawCanvas = require('./drawCanvas');
//var mainControl = require('./mainControl');
var littleCanvases = [];

window.onload = function () {
  for (var itr = 0; itr < 2; itr++) {
    //can(itr * 340 + 20, 40);
    littleCanvases[itr] = new littleCanvas(itr * 340 + 20, 40, map, constrain);
    //console.log(map)
  }
  //var main = new mainControl(littleCanvases);
  var tool = new paper.Tool();

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
};
//}

// var canvasGroup = document.getElementById('canvasGroup');
// var drawCanvas = document.createElement('canvas');
// drawCanvas.setAttribute('id', 'drawCanvas' + 0);
// canvasGroup.appendChild(drawCanvas);

//MVC???