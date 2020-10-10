'use strict';

const error = require( './error.js' );
const utils = require( './utils.js' );

function wellformed_array( a ) {
	for ( let i = 0; i < a.length; i++ ) {
		const w = wellformed( a[ i ] );
		if ( w.Z1K1 === 'Z5' && w.Z5K1 === error.not_wellformed ) {
			return error(
				error.not_wellformed,
				[ error.array_element_not_well_formed, i.toString(), w ]
			);
		}
	}
	return a;
}

function wellformed_reference( o ) {
	const keys = Object.keys( o );
	if ( keys.length !== 2 ) {
		return error( error.not_wellformed, [ error.z9_must_have_2_keys, o ] );
	}
	if ( !( keys.includes( 'Z9K1' ) || keys.includes( 'K1' ) ) ) {
		return error( error.not_wellformed, [ error.z9_without_z9k1, o ] );
	}
	const string_value = keys.includes( 'Z9K1' ) ? o.Z9K1 : o.K1;
	if ( !utils.is_string( string_value ) ) {
		return error( error.not_wellformed, [ error.z9k1_must_be_string, string_value ] );
	}
	if ( !utils.is_reference( string_value ) ) {
		return error( error.not_wellformed, [ error.z9k1_must_be_reference, string_value ] );
	}
	return o;
}

function wellformed_zstring( o ) {
	const keys = Object.keys( o );
	if ( keys.length !== 2 ) {
		return error( error.not_wellformed, [ error.z6_must_have_2_keys, o ] );
	}
	if ( !( keys.includes( 'Z6K1' ) || keys.includes( 'K1' ) ) ) {
		return error( error.not_wellformed, [ error.z6_without_z6k1, o ] );
	}
	const string_value = keys.includes( 'Z6K1' ) ? o.Z6K1 : o.K1;
	if ( !utils.is_string( string_value ) ) {
		return error( error.not_wellformed, [ error.z6k1_must_be_string, string_value ] );
	}
	return o;
}

function wellformed_object( o ) {
	const keys = Object.keys( o );
	if ( !keys.includes( 'Z1K1' ) ) {
		return error( error.not_wellformed, [ error.missing_type, o ] );
	}
	if ( !utils.is_object( o.Z1K1 ) && utils.is_string( o.Z1K1 ) && !utils.is_zid( o.Z1K1 ) ) {
		return error( error.not_wellformed, [ error.z1k1_must_not_be_string_or_array, o ] );
	}

	if ( o.Z1K1 === 'Z5' ) {
		return o;
	}
	if ( o.Z1K1 === 'Z6' ) {
		return wellformed_zstring( o );
	}
	if ( o.Z1K1 === 'Z9' ) {
		return wellformed_reference( o );
	}

	for ( let i = 0; i < keys.length; i++ ) {
		if ( !utils.is_key( keys[ i ] ) ) {
			return error( error.not_wellformed, [ error.invalid_key, keys[ i ] ] );
		}
		const v = wellformed( o[ keys[ i ] ] );
		if ( v.Z1K1 === 'Z5' && v.Z5K1 === error.not_wellformed ) {
			return error( error.not_wellformed, [ error.not_wellformed_value, keys[ i ], v ] );
		}
	}
	return o;
}

// input can be any JSON object
// the output will be either the same JSON object, or a Z5/Z402 error stating
// it is not well formed
function wellformed( o ) {
	if ( utils.is_string( o ) ) {
		return o;
	}
	if ( utils.is_array( o ) ) {
		return wellformed_array( o );
	}
	if ( utils.is_object( o ) ) {
		return wellformed_object( o );
	}
	return error(
		error.not_wellformed,
		[ error.zobject_must_not_be_number_or_boolean_or_null, o ]
	);
}

module.exports = wellformed;
