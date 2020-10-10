'use strict';

const utils = require( './utils.js' );
const error = require( './error.js' );
const get = require( './get.js' );

function get_implementation( call ) {
	const func = evaluate( call.Z7K1 );
	return evaluate( func.Z8K4.Z10K1 );
}

function is_builtin( impl ) {
	return Object.keys( impl ).includes( 'Z14K4' );
}

function is_native( impl ) {
	return Object.keys( impl ).includes( 'Z14K3' );
}

function is_composition( impl ) {
	return Object.keys( impl ).includes( 'Z14K2' );
}

function get_argument_list( func ) {
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
	const keys = Object.keys( call );
	const argument_values = [ ];
	for ( let i = 0; i < argument_list.length; i++ ) {
		if ( utils.is_global_key( argument_list[ i ] ) ) {
			const global_id = argument_list[ i ];
			const local_id = utils.kid_from_global_key( global_id );
			if ( keys.includes( global_id ) && keys.includes( local_id ) ) {
				return error( [ 'Z420' ], [ 'call to function has both global and local key with same id', call ] );
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
	// TODO: check impl.Z14K4.Z9K1
	// TODO: check if file exists
	return require( './builtin/' + impl.Z14K4.Z9K1 + '.js' );
}

function call_builtin( impl, call ) {
	const builtin = get_builtin( impl );
	const argument_list = get_argument_list( impl.Z14K1 );
	const argument_values = get_argument_values( argument_list, call );

	return builtin( argument_values );
}

function call_native( impl, call ) {
	return error( [ 'Z420' ], [ 'Native implementation not implemented yet', call, impl ] );
}

function call_composition( impl, call ) {
	return error( [ 'Z421' ], [ 'Composition not implemented yet', call, impl ] );
}

function evaluate_Z9( o ) {
	if ( Object.keys( o ).includes( 'Z9K1' ) && utils.is_string( o.Z9K1 ) ) {
		return get( o.Z9K1 );
	}
	return error( [ 'Z412' ], [ 'Error in evaluation of Z9', o ] );
}

function evaluate_Z7( o ) {
	const e = error( [ 'Z411' ], [ 'Error in evaluation of Z7', o ] );

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

// the input is assumed to be a well-formed, normalized ZObject,
// or else the behaviour is undefined
function evaluate( o ) {
	if ( utils.is_type( 'Z5', o ) ) {
		return o;
	}

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
