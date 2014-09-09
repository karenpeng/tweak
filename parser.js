module.exports = function () {

		var PEG = require('pegjs');
		var parser = PEG.buildParser(
				"
				start       =
				string      = '"
				' s:[^"]* '
				"' space { return s.join('') }
  			number      = float / integer
  			float       = s:'-'? n:(digit* '.' digit+) space { return parseFloat(s + n.flatten().join('')) }
  			integer     = s:'-'? d:digit+ space { return parseInt(s + d.join('')) }
  			digit       = [0123456789]
  			space       = ' '*
  			SPACE       = ' '+ / !.
				"
		)；

};