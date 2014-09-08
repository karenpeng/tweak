module.exports = function () {

  var CodeMirror = require('code-mirror');

  var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    mode: require('code-mirror/mode/javascript.js'),
    theme: require('code-mirror/theme/ambiance')
  });

};