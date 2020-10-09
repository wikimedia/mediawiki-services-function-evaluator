'use strict';

const utils = require( './utils.js' );
const error = require( './error.js' );
const get = require( './get.js' );

/* eslint-disable no-unused-vars */
function get_implementation( call ) {
	return undefined;
}

function is_builtin( impl ) {
	return true;
}

function is_native( impl ) {
	return false;
}

function is_composition( impl ) {
	return false;
}

function call_builtin( impl, call ) {
	return call;
}

function call_native( impl, call ) {
	return call;
}

function call_composition( impl, call ) {
	return call;
}
/* eslint-enable no-unused-vars */

function evaluate_Z9( o ) {
	if ( Object.keys( o ).includes( 'Z9K1' ) && utils.is_string( o.Z9K1 ) ) {
		return get( o.Z9K1 );
	}
	return error( 'Z412', 'Error in evaluation of Z9', o );
}

function evaluate_Z7( o ) {
	const e = error( 'Z411', 'Error in evaluation of Z7', o );

	// get implementation
	const impl = get_implementation( o );

	if ( impl === undefined ) {
		return e;
	}

	let result;
	if ( is_builtin( impl ) ) {
		result = call_builtin( impl, o );
	}
	if ( is_native( impl ) ) {
		result = call_native( impl, o );
	}
	if ( is_composition( impl ) ) {
		result = call_composition( impl, o );
	}
	return result;
}

// the input is assumed to be a well-formed, normalized ZObject,
// or else the behaviour is undefined
function evaluate( o ) {
	let result = o;
	if ( utils.is_type( 'Z7', o ) ) {
		result = evaluate_Z7( o );
	}
	if ( utils.is_type( 'Z9', o ) ) {
		result = evaluate_Z9( o );
	}

	if ( utils.deep_equal( result, o ) ) {
		return result;
	}
	return evaluate( result );
}

module.exports = evaluate;
