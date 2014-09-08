module.exports = function () {

  var CodeMirror = require('code-mirror');
  var jsMode = require('code-mirror/mode/javascript.js');
  // console.log(jsMode);

  var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    mode: jsMode,
    theme: require('code-mirror/theme/ambiance'),
    tabSize: 2
  });

  editor.on('change', function () {
    complie();
  });

  function complie() {
    console.log(editor.getValue());
  }
};