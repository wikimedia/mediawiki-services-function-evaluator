'use strict';

const { getZID, getZObjectType, z10ToList } = require( './utils.js' );

const DESERIALIZERS_ = new Map();

function deserializeZ10( Z10 ) {
	const head = Z10.Z10K1;
	if ( head === undefined ) {
		return [];
	}
	const deserializedTail = deserializeZ10( Z10.Z10K2 );
	deserializedTail.unshift( deserialize( head ) );
	return deserializedTail;
}

function deserializeZList( ZObject ) {
	const result = [];
	let tail = ZObject;
	while ( true ) {
		const head = tail.K1;
		if ( head === undefined ) {
			break;
		}
		result.push( deserialize( head ) );
		tail = tail.K2;
	}
	return result;
}

DESERIALIZERS_.set( 'Z6', ( Z6 ) => Z6.Z6K1 );
DESERIALIZERS_.set( 'Z10', deserializeZ10 );
// eslint-disable-next-line no-unused-vars
DESERIALIZERS_.set( 'Z21', ( Z21 ) => null );
DESERIALIZERS_.set( 'Z40', ( Z40 ) => Z40.Z40K1.Z9K1 === 'Z41' );
DESERIALIZERS_.set( 'Z86', ( Z86 ) => Z86.Z86K1.Z6K1 );
// TODO(T292260): Get a non-criminal ZID.
DESERIALIZERS_.set( 'Z1010', deserializeZList );

/**
 * Convert a ZObject into the corresponding JS type.
 * Z6 -> String
 * Z10 -> Array
 * Z21 -> Null
 * Z40 -> Boolean
 *
 * @param {Object} ZObject
 * @return {Object}
 */
function deserialize( ZObject ) {
	const ZID = getZObjectType( ZObject );
	const deserializer = DESERIALIZERS_.get( ZID );
	if ( deserializer === undefined ) {
		throw Error( 'Could not deserialize input ZObject type: ' + ZID );
	}
	return deserializer( ZObject );
}

function emptyZ10() {
	return {
		Z1K1: {
			Z1K1: 'Z9',
			Z9K1: 'Z10'
		}
	};
}

function serializeZ10( theArray ) {
	const result = emptyZ10();
	const nextElement = theArray.shift();
	if ( nextElement !== undefined ) {
		result.Z10K1 = serialize( nextElement );
		result.Z10K2 = serializeZ10( theArray );
	}
	return result;
}

// eslint-disable-next-line no-unused-vars
function serializeZ21( nothing ) {
	return { Z1K1: { Z1K1: 'Z9', Z9K1: 'Z21' } };
}

function serializeZ40( theBoolean ) {
	let ZID;
	if ( theBoolean ) {
		ZID = 'Z41';
	} else {
		ZID = 'Z42';
	}
	return {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z40' },
		Z40K1: { Z1K1: 'Z9', Z9K1: ZID }
	};
}

function serializeZList( theArray, expectedType, index = 0 ) {
	const result = {
		Z1K1: expectedType
	};
	if ( index < theArray.length ) {
		const expectedArgs = z10ToList( expectedType.Z4K2 );
		const headKey = expectedArgs[ 0 ];
		result[ headKey.Z3K2.Z6K1 ] = serialize( theArray[ index ], headKey.Z3K1 );
		const tailKey = expectedArgs[ 1 ];
		result[ tailKey.Z3K2.Z6K1 ] = serializeZList( theArray, expectedType, index + 1 );
	}
	return result;
}

const SERIALIZERS_ = new Map();
SERIALIZERS_.set( 'Z6', ( theString ) => {
	return { Z1K1: 'Z6', Z6K1: theString };
} );
SERIALIZERS_.set( 'Z10', serializeZ10 );
SERIALIZERS_.set( 'Z21', serializeZ21 );
SERIALIZERS_.set( 'Z40', serializeZ40 );
// TODO(T292260): Get a non-criminal ZID.
SERIALIZERS_.set( 'Z1010', serializeZList );

/**
 * Convert a JS object into the corresponding ZObject type.
 * String -> Z6
 * Array -> Z10
 * Null -> Z21
 * Boolean -> Z40
 *
 * @param {Object} theObject
 * @param {Object} expectedType
 * @return {Object} the serialized ZObject
 */
function serialize( theObject, expectedType ) {
	const ZID = getZID( expectedType );
	const serializer = SERIALIZERS_.get( ZID );
	if ( ZID === null || serializer === undefined ) {
		throw Error( 'Could not serialize input JS object: ' + Object.prototype.toString.call( theObject ) );
	}
	return serializer( theObject, expectedType );
}

module.exports = { deserialize, serialize };
