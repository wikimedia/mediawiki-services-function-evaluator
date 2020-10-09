'use strict';

// builtin for head: takes a Z10 and return Z10K1 (takes a list and returns the first element)

const error = require( '../error.js' );
const utils = require( '../utils.js' );

function builtin( args ) {
	if ( args.length !== 1 ) {
		return error( 'Z411', 'Wrong number of arguments for builtin B1, should be 1', args );
	}
	const arg = args[ 0 ];
	if ( !utils.is_type( 'Z10', arg ) ) {
		return error( 'Z410', 'Type error on argument in builtin B1, should be Z10', arg );
	}
	if ( !Object.keys( arg ).includes( 'Z10K1' ) && !Object.keys( arg ).includes( 'K1' ) ) {
		return error( 'Z413', 'head on empty list', arg );
	}
	if ( Object.keys( arg ).includes( 'Z10K1' ) ) {
		return arg.Z10K1;
	}
	return arg.K1;
}

module.exports = builtin;
