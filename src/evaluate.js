'use strict';

const utils = require( './utils.js' );
const error = require( './error.js' );
const resolve = require( './resolve.js' );
const fs = require( 'fs' );
const path = require( 'path' );

function get_implementation( call ) {
	// TODO: this really should be 'K1' on the second argument, not 'Z7K1'.
	// But this can only be changed after we have the generic function model
	// implemented, as until then we have to treat Z7K1 special. Sigh.
	const func = evaluate( get( 'Z7', 'Z7K1', call ) );
	// TODO: this simply takes the first implementation. Good enough for
	// now, in the sense that it is better than nothing, but this really
	// should be considerably improved.
	return evaluate( func.Z8K4.Z10K1 );
}

function is_builtin( impl ) {
	return has( 'Z14', 'K4', impl );
}

function is_native( impl ) {
	return has( 'Z14', 'K3', impl );
}

function is_composition( impl ) {
	return has( 'Z14', 'K2', impl );
}

function get_argument_list( func ) {
	const f = evaluate( func );
	let argument_list = get( 'Z8', 'K1', f );
	const list = [ ];
	while ( has( 'Z10', 'K2', argument_list ) ) {
		list.push( get( 'Z6', 'K1', get( 'Z17', 'K2', get( 'Z10', 'K1', argument_list ) ) ) );
		argument_list = get( 'Z10', 'K2', argument_list );
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

function good_bid( bid ) {
	return /^B[1-9][0-9]*$/.test( bid );
}

function load_builtin( impl ) {
	const z14k4 = get( 'Z14', 'K4', impl );
	if ( !has( 'Z9', 'K1', z14k4 ) ) {
		return () => {
			return error( [ error.builtin_id_error ], [ impl ] );
		};
	}
	const bid = get( 'Z9', 'K1', z14k4 );
	if ( !good_bid( bid ) ) {
		return () => {
			return error( [ error.builtin_id_error ], [ impl ] );
		};
	}
	const builtin_path = path.resolve( __dirname, './builtin/' + bid + '.js' );
	if ( !fs.existsSync( builtin_path ) ) {
		return () => {
			return error( [ error.builtin_does_not_exist ], [ impl ] );
		};
	}
	return require( builtin_path );
}

function call_builtin( impl, call ) {
	const builtin = load_builtin( impl );
	const argument_list = get_argument_list( impl.Z14K1 );
	const argument_values = get_argument_values( argument_list, call );
	if ( argument_values.Z1K1 === 'Z5' ) {
		return argument_values;
	}

	return builtin( argument_values );
}

/* eslint-disable no-unused-vars */
function call_native( impl, call ) {
	// TODO: implement and test
	return error( [ error.not_implemented_yet ], [ 'evaluate.call_native' ] );
}
/* eslint-enable no-unused-vars */

/* eslint-disable no-unused-vars */
function call_composition( impl, call ) {
	// TODO: implement and test
	return error( [ error.not_implemented_yet ], [ 'evaluate.call_composition' ] );
}
/* eslint-enable no-unused-vars */

function evaluate_Z7( o ) {
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

function evaluate_Z9( o ) {
	const zid = get( 'Z9', 'K1', o );
	if ( utils.is_string( zid ) ) {
		return resolve( zid );
	} else {
		return error( [ error.z9_error ], [ o ] );
	}
}

function get( zid, kid, o ) {
	// if a Z7 or a Z9, and not asking for a Z7 or Z9,
	// then evaluate before answering
	const keys = Object.keys( o );
	if ( zid === undefined ) {
		if ( keys.includes( kid ) ) {
			return o[ kid ];
		} else {
			return error( [ error.key_not_fund ], [ kid, o ] );
		}
	}
	if ( keys.includes( kid ) ) {
		return o[ kid ];
	}
	if ( keys.includes( zid + kid ) ) {
		return o[ zid + kid ];
	}
	if ( zid === 'Z7' || zid === 'Z9' ) {
		return error( [ error.key_not_fund ], [ zid + kid, o ] );
	}
	if ( is( 'Z9', o ) ) {
		return get( zid, kid, evaluate_Z9( o ) );
	}
	if ( is( 'Z7', o ) ) {
		return get( zid, kid, evaluate( o ) );
	}
	return error( [ error.key_not_fund ], [ zid + kid, o ] );
}

function has( zid, kid, o ) {
	// if a Z7 or a Z9, and not asking for a Z7 or Z9,
	// then evaluate before answering
	const keys = Object.keys( o );
	if ( zid === undefined ) {
		return keys.includes( kid );
	}
	const result = keys.includes( kid ) || keys.includes( zid + kid );
	if ( result ) {
		return true;
	}
	if ( zid === 'Z7' || zid === 'Z9' ) {
		return false;
	}
	if ( is( 'Z9', o ) ) {
		return has( zid, kid, evaluate_Z9( o ) );
	}
	if ( is( 'Z7', o ) ) {
		return has( zid, kid, evaluate( o ) );
	}
	return false;
}

function is( type, o ) {
	// if a Z7 or a Z9, and not asking for a Z7 or Z9,
	// then evaluate before answering
	if ( utils.is_string( o.Z1K1 ) ) {
		if ( o.Z1K1 === type ) {
			return true;
		}
		if ( o.Z1K1 === 'Z7' ) {
			return is( type, evaluate( o ) );
		}
		if ( o.Z1K1 === 'Z9' ) {
			return is( type, evaluate_Z9( o ) );
		}
		return false;
	}
	if ( is( 'Z9', o.Z1K1 ) ) {
		return get( 'Z9', 'K1', o.Z1K1 ) === type;
	}
	if ( is( 'Z4', o.Z1K1 ) ) {
		return is( type, { Z1K1: get( 'Z4', 'K1', o.Z1K1 ) } );
	}
	if ( is( 'Z7', o.Z1K1 ) ) {
		return is( type, { Z1K1: get( 'Z4', 'K1', evaluate( o.Z1K1 ) ) } );
	}
	return false;
}

// the input must be a valid and normal ZObject, or else undefined behaviour
function evaluate( o ) {
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
evaluate.get = get;
evaluate.has = has;
module.exports = evaluate;
