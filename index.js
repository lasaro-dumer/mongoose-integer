/* jshint node: true */
'use strict';

module.exports = function(schema, options) {
	options = options || {};
	var message = options.message || 'Error, expected `{PATH}` to be an integer. Value: `{VALUE}`';

	var addIntegerValidation = function(pathname, schema) {
		var instance = schema.paths[pathname].instance;
		var options = schema.paths[pathname].options;

		if (options.integer && instance === 'Number') {
			var pathMessage = message;
			if (typeof options.integer === 'string') {
				pathMessage = options.integer;
			}

			schema.path(pathname).validate(function(value) {
				if (value && parseInt(value) !== value)
					this.invalidate(pathname, pathMessage, value);
			}, pathMessage);
		}
		else if (instance === 'Array') {
			if (options.type && options.type.length > 0 && options.type[0].integer) {
				var pathMessage = message;
				if (typeof options.type[0].integer === 'string') {
					pathMessage = options.type[0].integer;
				}

				schema.path(pathname).validate(function(value) {
					if(value && value.length > 0)
						for (var v of value)
							if(!(parseInt(v) === v))
								this.invalidate(pathname, pathMessage, value);
				}, pathMessage);
			}
		}
	};

	var recursiveIteration = function(schema) {
		for (var key in schema.paths) {
			if (schema.paths[key].schema) recursiveIteration(schema.paths[key].schema);
			else addIntegerValidation(schema.paths[key].path, schema);
		}
	};

	recursiveIteration(schema);
};
