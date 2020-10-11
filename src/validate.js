'use strict';

const utils = require( './utils.js' );
const error = require( './error.js' );

function validate_z6( o ) {
	const errors = [ ];
	const keys = Object.keys( o );
	if ( keys.length !== 2 ) {
		errors.push( error( error.not_wellformed, [ error.z6_must_have_2_keys, o ] ) );
	}
	if ( !( keys.includes( 'Z6K1' ) || keys.includes( 'K1' ) ) ) {
		errors.push( error( error.not_wellformed, [ error.z6_without_z6k1, o ] ) );
		return errors;
	}
	const string_value = keys.includes( 'Z6K1' ) ? o.Z6K1 : o.K1;
	if ( !utils.is_string( string_value ) ) {
		errors.push( error( error.not_wellformed, [ error.z6k1_must_be_string, string_value ] ) );
	}
	return errors;
}

// the input is assumed to be a normalized, well-formed input
function validate( o ) {
	if ( o.Z1K1 === 'Z6' ) {
		return validate_z6( o );
	}

	if ( o.Z1K1 === 'Z5' ) {
		if ( o.Z5K1.Z1K1 === error.syntax_error ||
			o.Z5K1.Z1K1 === error.not_wellformed ) {
			return [ o ];
		}
	}

	return [ ];
}

module.exports = validate;
