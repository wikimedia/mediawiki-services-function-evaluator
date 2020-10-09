'use strict';

const error = require( './error.js' );
const utils = require( './utils.js' );

function wellformed_string( s ) {
	return s;
}

function wellformed_array( a ) {
	for ( let i = 0; i < a.length; i++ ) {
		const w = wellformed( a[ i ] );
		if ( w.Z1K1 === 'Z5' && w.Z5K1 === 'Z402' ) {
			return error( 'Z402', 'Element ' + i.toString() + ' is not wellformed.', w );
		}
	}
	return a;
}

function is_valid_key_reference( k ) {
	return k.match( /^(Z[1-9]\d*)?K[1-9]\d*$/ ) !== null;
}

function is_valid_zid( k ) {
	return k.match( /^Z[1-9]\d*$/ ) !== null;
}

function is_object( o ) {
	return !utils.is_array( o ) && typeof o === 'object' && o !== null;
}

function wellformed_object( o ) {
	const keys = Object.keys( o );
	if ( !keys.includes( 'Z1K1' ) ) {
		return error( 'Z402', 'Every object needs a Z1K1', o );
	}
	if ( !is_object( o.Z1K1 ) && utils.is_string( o.Z1K1 ) && !is_valid_zid( o.Z1K1 ) ) {
		return error( 'Z402', 'Z1K1 must have a type as a value.', o );
	}
	if ( keys.includes( 'Z9K1' ) && !is_object( o.Z9K1 ) ) {
		if ( !utils.is_string( o.Z9K1 ) || !utils.is_reference( o.Z9K1 ) ) {
			return error( 'Z402', 'Z9K1 must be a reference.', o );
		}
	}
	if ( keys.includes( 'Z6K1' ) && utils.is_array( o.Z6K1 ) ) {
		return error( 'Z402', 'Z6K1 must be a string.', o );
	}
	for ( let i = 0; i < keys.length; i++ ) {
		if ( !is_valid_key_reference( keys[ i ] ) ) {
			return error( 'Z402', 'Key not a valid key reference', keys[ i ] );
		}
		const v = wellformed( o[ keys[ i ] ] );
		if ( v.Z1K1 === 'Z5' && v.Z5K1 === 'Z402' ) {
			return error( 'Z402', 'Value of ' + keys[ i ] + ' is not wellformed.', v );
		}
	}
	return o;
}

// input can be any JSON object
// the output will be either the same JSON object, or a Z5/Z402 error stating
// it is not well formed
function wellformed( o ) {
	if ( utils.is_string( o ) ) {
		return wellformed_string( o );
	}
	if ( utils.is_array( o ) ) {
		return wellformed_array( o );
	}
	if ( is_object( o ) ) {
		return wellformed_object( o );
	}
	return error( 'Z402', 'ZObject JSON must be a string, array, or object', o );
}

module.exports = wellformed;
