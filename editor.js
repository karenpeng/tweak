var CodeMirror = require('codemirror');

var myCodeMirror = CodeMirror(document.getElementById('editor'), {
		value: "type here",
		mode: "javascript"
});

myCodeMirror.setOption("theme", "lesser-dark");