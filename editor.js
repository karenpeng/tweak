module.exports = function () {

  var CodeMirror = require('codemirror');

  var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true
  });

  editor.setOption("theme", "lesser-dark");

};