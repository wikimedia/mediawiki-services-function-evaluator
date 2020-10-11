'use strict';

// builtin for head: takes a Z10 and return Z10K1 (takes a list and returns the first element)

const error = require( '../error.js' );
const evaluate = require( '../evaluate.js' );

function builtin( args ) {
	if ( args.length !== 1 ) {
		return error( [ error.builtin_number_of_arguments_mismatch ], [ '1', args.length.toString(), args ] );
	}
	const arg = args[ 0 ];
	if ( !evaluate.is_type( 'Z10', arg ) ) {
		return error( [ error.argument_type_error ], [ 'Z10', arg.Z1K1, arg ] );
	}
	// TODO: replace that with a has_key(Z10, K1)
	if ( !Object.keys( arg ).includes( 'Z10K1' ) && !Object.keys( arg ).includes( 'K1' ) ) {
		return error( [ error.nil ], [ ] );
	}
	// TODO: replace that with a by_key(Z10, K1)
	if ( Object.keys( arg ).includes( 'Z10K1' ) ) {
		return arg.Z10K1;
	}
	return arg.K1;
}

module.exports = builtin;
