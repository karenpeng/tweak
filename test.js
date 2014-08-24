//var watchify = require('watchify');
var can = require("./can");
var myCanvas = document.getElementById('myCanvas');
paper.setup(myCanvas);
//paper.install(window);
//var i = 0; window.onload = function () {
// var canvasGroup = document.getElementById('canvasGroup');
//with(paper){
window.onload = function () {
  for (var itr = 0; itr < 2; itr++) {
    can(itr * 340 + 20, 40);
  }
};
//}

// var canvasGroup = document.getElementById('canvasGroup');
// var drawCanvas = document.createElement('canvas');
// drawCanvas.setAttribute('id', 'drawCanvas' + 0);
// canvasGroup.appendChild(drawCanvas);

//MVC???