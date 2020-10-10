'use strict';

const utils = require( './utils.js' );

function canonicalize_array( a ) {
	return a.map( canonicalize );
}

function canonicalize_object( o ) {
	const keys = Object.keys( o );

	o.Z1K1 = canonicalize( o.Z1K1 );

	if ( o.Z1K1 === 'Z5' && ( o.Z5K1.Z1K1 === 'Z401' || o.Z5K1.Z1K1 === 'Z402' ) ) {
		return o;
	}

	if ( o.Z1K1 === 'Z9' ) {
		if ( keys.length === 2 ) {
			if ( keys.includes( 'Z9K1' ) ) {
				o.Z9K1 = canonicalize( o.Z9K1 );
				if ( utils.is_string( o.Z9K1 ) ) {
					if ( utils.is_reference( o.Z9K1 ) ) {
						return o.Z9K1;
					}
				}
			}
		}
	}

	if ( o.Z1K1 === 'Z6' ) {
		if ( keys.length === 2 ) {
			if ( keys.includes( 'Z6K1' ) ) {
				o.Z6K1 = canonicalize( o.Z6K1 );
				if ( utils.is_string( o.Z6K1 ) ) {
					if ( !utils.is_reference( o.Z6K1 ) ) {
						return o.Z6K1;
					}
				}
			}
		}
	}

	if ( o.Z1K1 === 'Z10' ) {
		if ( keys.length === 1 ) {
			return [];
		}

		if ( keys.length === 2 ) {
			if ( keys.includes( 'Z10K1' ) ) {
				return [ canonicalize( o.Z10K1 ) ];
			}
		}

		if ( keys.length === 3 ) {
			if ( keys.includes( 'Z10K1' ) && keys.includes( 'Z10K2' ) ) {
				return [ canonicalize( o.Z10K1 ) ].concat( canonicalize( o.Z10K2 ) );
			}
		}
	}

	for ( let i = 0; i < keys.length; i++ ) {
		o[ keys[ i ] ] = canonicalize( o[ keys[ i ] ] );
	}

	return o;
}

// the input is assumed to be a well-formed ZObject, or else the behaviour is undefined
function canonicalize( o ) {
	if ( utils.is_string( o ) ) {
		return o;
	}

	if ( utils.is_array( o ) ) {
		return canonicalize_array( o );
	}

	return canonicalize_object( o );
}

module.exports = canonicalize;
