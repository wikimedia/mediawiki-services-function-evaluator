'use strict';

const utils = require( './utils.js' );
const error = require( './error.js' );
const get = require( './get.js' );

// TODO: rename get to resolve, and by_key to get

function get_implementation( call ) {
	// TODO: rewrite
	const func = evaluate( call.Z7K1 );
	return evaluate( func.Z8K4.Z10K1 );
}

function is_builtin( impl ) {
	// TODO: replace with has
	return Object.keys( impl ).includes( 'Z14K4' );
}

function is_native( impl ) {
	// TODO: replace with has
	return Object.keys( impl ).includes( 'Z14K3' );
}

function is_composition( impl ) {
	// TODO: replace with has
	return Object.keys( impl ).includes( 'Z14K2' );
}

function get_argument_list( func ) {
	// TODO: rewrite
	const f = evaluate( func );
	let argument_list = f.Z8K1;
	const list = [ ];
	while ( Object.keys( argument_list ).includes( 'Z10K2' ) ) {
		list.push( argument_list.Z10K1.Z17K2.Z6K1 );
		argument_list = argument_list.Z10K2;
	}
	return list;
}

function get_argument_values( argument_list, call ) {
	// TODO: rewrite
	const keys = Object.keys( call );
	const argument_values = [ ];
	for ( let i = 0; i < argument_list.length; i++ ) {
		if ( utils.is_global_key( argument_list[ i ] ) ) {
			const global_id = argument_list[ i ];
			const local_id = utils.kid_from_global_key( global_id );
			if ( keys.includes( global_id ) && keys.includes( local_id ) ) {
				return error( [ error.competing_keys ], [ call ] );
			}
			if ( !keys.includes( global_id ) && !keys.includes( local_id ) ) {
				argument_values.push( undefined );
			}
			if ( keys.includes( global_id ) ) {
				argument_values.push( call[ global_id ] );
			} else {
				argument_values.push( call[ local_id ] );
			}
		} else {
			argument_values.push( call[ argument_list[ i ] ] );
		}
	}
	return argument_values;
}

function get_builtin( impl ) {
	// TODO: rewrite
	// TODO: check impl.Z14K4.Z9K1
	// TODO: check if file exists
	return require( './builtin/' + impl.Z14K4.Z9K1 + '.js' );
}

function call_builtin( impl, call ) {
	// TODO: rewrite
	const builtin = get_builtin( impl );
	const argument_list = get_argument_list( impl.Z14K1 );
	const argument_values = get_argument_values( argument_list, call );

	return builtin( argument_values );
}

/* eslint-disable no-unused-vars */
function call_native( impl, call ) {
	// TODO: implement
	return error( [ error.not_implemented_yet ], [ 'evaluate.call_native' ] );
}

function call_composition( impl, call ) {
	// TODO: implement
	return error( [ error.not_implemented_yet ], [ 'evaluate.call_composition' ] );
}
/* eslint-enable no-unused-vars */

function evaluate_Z9( o ) {
	// TODO: rewrite. Assume Z9 is correct. by_key(Z9 K1) and then get that
	// check get.js
	if ( Object.keys( o ).includes( 'Z9K1' ) && utils.is_string( o.Z9K1 ) ) {
		return get( o.Z9K1 );
	}
	return error( [ 'Z412' ], [ 'Error in evaluation of Z9', o ] );
}

function evaluate_Z7( o ) {
	// TODO: rewrite
	const e = error( [ error.error_in_evaluation ], [ o ] );

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
	if ( result === undefined ) {
		return e;
	}
	return result;
}

function is( type, o ) {
	if ( utils.is_string( o.Z1K1 ) ) {
		return o.Z1K1 === type;
	}
	if ( is( 'Z9', o.Z1K1 ) ) {
		// TODO: replace with by_key(Z9, K1)
		return o.Z1K1.Z9K1 === type;
	}
	// TODO: replace with by_key(Z4, K1).by_key(Z9 K1)?
	return evaluate( o.Z1K1 ).Z4K1.Z9K1 === type;
}

// the input must be a valid and normal ZObject, or else undefined behaviour
function evaluate( o ) {
	if ( is( 'Z5', o ) ) {
		return o;
	}

	let result = utils.deep_copy( o );
	if ( is( 'Z7', o ) ) {
		result = evaluate_Z7( o );
	}
	if ( is( 'Z9', o ) ) {
		result = evaluate_Z9( o );
	}
	if ( utils.deep_equal( result, o ) ) {
		return o;
	}
	return evaluate( result );
}

evaluate.is = is;
module.exports = evaluate;
