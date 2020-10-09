'use strict';

// builtin for head: takes a Z10 and return Z10K1 (takes a list and returns the first element)

const error = require( '../error.js' );
const utils = require( '../utils.js' );

function builtin( arg ) {
	if ( !utils.is_type( 'Z10', arg ) ) {
		return error( 'Z410', 'Error in builtin B1', arg );
	}
	if ( !Object.keys( arg ).includes( 'Z10K1' ) ) {
		return error( 'Z413', 'head on empty list', arg );
	}
	return arg.Z10K1;
}

module.exports = builtin;
