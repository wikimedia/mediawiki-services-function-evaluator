'use strict';

// builtin for head: takes a Z10 and return Z10K2
// (takes a list and returns anything but the first element)

const error = require( '../error.js' );
const evaluate = require( '../evaluate.js' );

function builtin( args ) {
	if ( args.length !== 1 ) {
		return error( [ error.builtin_number_of_arguments_mismatch ], [ '1', args.length.toString(), args ] );
	}
	const arg = args[ 0 ];
	if ( !evaluate.is( 'Z10', arg ) ) {
		return error( [ error.argument_type_error ], [ 'Z10', arg.Z1K1, arg ] );
	}
	if ( !evaluate.has( 'Z10', 'K2', arg ) ) {
		return error( [ error.nil ], [ ] );
	}
	if ( evaluate.has( 'Z10', 'K2', arg ) ) {
		return evaluate.get( 'Z10', 'K2', arg );
	}
	return arg.K2;
}

module.exports = builtin;
