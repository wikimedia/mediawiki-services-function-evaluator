'use strict';

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

DESERIALIZERS_.set( 'Z6', ( Z6 ) => Z6.Z6K1 );
DESERIALIZERS_.set( 'Z10', deserializeZ10 );
// eslint-disable-next-line no-unused-vars
DESERIALIZERS_.set( 'Z21', ( Z21 ) => null );
DESERIALIZERS_.set( 'Z40', ( Z40 ) => Z40.Z40K1.Z9K1 === 'Z41' );

/**
 * Determine the ZID corresponding to the type of a ZObject.
 *
 * @param {Object} ZObject
 * @return {string} the object's type ZID
 */
function getZObjectType( ZObject ) {
	const Z1K1 = ZObject.Z1K1;
	const Z9K1 = Z1K1.Z9K1;
	if ( Z9K1 !== undefined ) {
		// Z1K1 for most types is a Z9.
		return Z9K1;
	}
	// Otherwise, Z1K1 is a string or None, meaning original object was a Z6
	// or Z9 (or not a good ZObject).
	return Z1K1;
}

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

const SERIALIZERS_ = new Map();
SERIALIZERS_.set( 'Z6', ( theString ) => {
	return { Z1K1: 'Z6', Z6K1: theString };
} );
SERIALIZERS_.set( 'Z10', serializeZ10 );
SERIALIZERS_.set( 'Z21', serializeZ21 );
SERIALIZERS_.set( 'Z40', serializeZ40 );

const typeMap = new Map();
typeMap.set( 'String', 'Z6' );
typeMap.set( 'Array', 'Z10' );
typeMap.set( 'Null', 'Z21' );
typeMap.set( 'Boolean', 'Z40' );

/**
 * Infer the type of a JS object and try to find the corresponding ZID.
 * String -> Z6
 * Array -> Z10
 * Null -> Z21
 * Boolean -> Z40
 *
 * @param {Object} theObject
 * @return {string} the ZID corresponding to the appropriate serialized type
 */
function getZIDForJSType( theObject ) {
	const typeRegex = /\[object (\w*)\]/;
	// Object.toString will retur n[object <TYPE>]; <TYPE> is what we're after.
	const typeString = Object.prototype.toString.call( theObject ).replace( typeRegex, '$1' );
	const ZID = typeMap.get( typeString );
	return ZID;
}

/**
 * Convert a JS object into the corresponding ZObject type.
 * String -> Z6
 * Array -> Z10
 * Null -> Z21
 * Boolean -> Z40
 *
 * @param {Object} theObject
 * @return {Object} the serialized ZObject
 */
function serialize( theObject ) {
	const ZID = getZIDForJSType( theObject );
	const serializer = SERIALIZERS_.get( ZID );
	if ( ZID === null || serializer === undefined ) {
		throw Error( 'Could not serialize input JS object: ' + Object.prototype.toString.call( theObject ) );
	}
	return serializer( theObject );
}

module.exports = { deserialize, serialize };
