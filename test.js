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