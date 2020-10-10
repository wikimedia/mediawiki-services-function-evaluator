'use strict';

function error( code, args ) {
	const error_object = {
		Z1K1: 'Z5',
		Z5K1: code
	};
	if ( args.length === 0 ) {
		return error_object;
	}

	const inner_object = {
		Z1K1: code
	};
	for ( let i = 0; i < args.length; i++ ) {
		inner_object[ code + 'K' + ( i + 1 ).toString() ] = args[ i ];
	}
	error_object.Z5K2 = inner_object;

	return error_object;
}

error.syntax_error = 'Z401'; // message from parser, input string

module.exports = error;
