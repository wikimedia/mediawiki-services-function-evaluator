'use strict';

const { getListType, getZIDForJSType, getZObjectType, soupUpZ1K1 } = require( './utils.js' );
const { ZObject, ZPair } = require( './ztypes.js' );

const { convertItemArrayToZList } = require( './function-schemata/javascript/src/utils.js' );
const { inspect } = require( 'util' );

const DESERIALIZERS_ = new Map();

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

function deserializeZMap( ZObject ) {
	const result = new Map();
	for ( const pair of deserialize( ZObject.K1 ) ) {
		result.set( pair.K1, pair.K2 );
	}
	return result;
}

// TODO (T290898): This can serve as a model for default deserialization--all
// local keys can be deserialized and set as members.
function deserializeZPair( ZObject ) {
	return new ZPair( deserialize( ZObject.K1 ), deserialize( ZObject.K2 ), ZObject.Z1K1 );
}

function deserializeZType( theObject ) {
	let Z1K1;
	const kwargs = new Map();
	for ( const key of Object.keys( theObject ) ) {
		const value = theObject[ key ];
		if ( key === 'Z1K1' ) {
			Z1K1 = value;
		} else {
			kwargs.set( key, deserialize( value ) );
		}
	}
	return new ZObject( kwargs, Z1K1 );
}

DESERIALIZERS_.set( 'Z6', ( Z6 ) => Z6.Z6K1 );
// eslint-disable-next-line no-unused-vars
DESERIALIZERS_.set( 'Z21', ( Z21 ) => null );
DESERIALIZERS_.set( 'Z40', ( Z40 ) => Z40.Z40K1.Z9K1 === 'Z41' );
DESERIALIZERS_.set( 'Z881', deserializeZList );
DESERIALIZERS_.set( 'Z882', deserializeZPair );
DESERIALIZERS_.set( 'Z883', deserializeZMap );
const DEFAULT_DESERIALIZER_ = deserializeZType;

/**
 * Convert a ZObject into the corresponding JS type.
 * Z6 -> String
 * Z21 -> Null
 * Z40 -> Boolean
 * Typed List ( Z881-generated type ) -> Array
 * Typed Pair ( Z882-generated type ) -> ZPair
 * Typed Map ( Z883-generated type ) -> Map
 * anything else -> ZObject
 *
 * @param {Object} ZObject
 * @return {Object}
 */
function deserialize( ZObject ) {
	const ZID = getZObjectType( ZObject );
	let deserializer = DESERIALIZERS_.get( ZID );
	if ( deserializer === undefined ) {
		deserializer = DEFAULT_DESERIALIZER_;
	}
	return deserializer( ZObject );
}

function serializeZ21() {
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

function serializeZList( theArray ) {
	const elements = [];
	for ( const element of theArray ) {
		elements.push( serialize( element ) );
	}
	return convertItemArrayToZList( elements );
}

// TODO (T290898): This can serve as a model for default deserialization--all
// local keys can be serialized and set as members.
function serializeZType( theObject ) {
	const Z1K1 = theObject.Z1K1;
	if ( Z1K1 === undefined || Z1K1 === null ) {
		throw new Error( 'Could not serialize input JS object: ' + inspect( theObject ) );
	}
	const result = { Z1K1: Z1K1 };
	for ( const key of Object.keys( theObject ) ) {
		if ( key === 'Z1K1' ) {
			continue;
		}
		result[ key ] = serialize( theObject[ key ] );
	}
	return result;
}

function serializeZMap( theMap ) {
	const serializedKeys = [];
	for ( const key of theMap.keys() ) {
		serializedKeys.push( serialize( key ) );
	}
	const serializedValues = [];
	for ( const value of theMap.values() ) {
		serializedValues.push( serialize( value ) );
	}
	const keyType = getListType( serializedKeys );
	const valueType = getListType( serializedValues );
	const pairList = [];
	for ( const entry of theMap.entries() ) {
		pairList.push( new ZPair( ...entry ) );
	}
	return {
		Z1K1: {
			Z1K1: soupUpZ1K1( 'Z7' ),
			Z7K1: soupUpZ1K1( 'Z883' ),
			Z883K1: keyType,
			Z883K2: valueType
		},
		K1: serialize( pairList )
	};
}

const SERIALIZERS_ = new Map();
SERIALIZERS_.set( 'Z6', ( theString ) => {
	return { Z1K1: 'Z6', Z6K1: theString };
} );
SERIALIZERS_.set( 'Z21', serializeZ21 );
SERIALIZERS_.set( 'Z40', serializeZ40 );
SERIALIZERS_.set( 'Z881', serializeZList );
SERIALIZERS_.set( 'Z882', serializeZType );
SERIALIZERS_.set( 'Z883', serializeZMap );
const DEFAULT_SERIALIZER_ = serializeZType;

/**
 * Convert a JS object into the corresponding ZObject type.
 * String -> Z6
 * null -> Z21
 * Boolean -> Z40
 * Array -> Typed List ( Z881-generated type )
 * ZPair -> Typed Pair ( Z882-generated type )
 * Map -> Typed Map ( Z883-generated type )
 * ZObject -> arbitrary ZObject
 *
 * @param {Object} theObject
 * @param {Object} expectedType
 * @return {Object} the serialized ZObject
 */
function serialize( theObject ) {
	const ZID = getZIDForJSType( theObject );
	let serializer = SERIALIZERS_.get( ZID );
	if ( serializer === undefined ) {
		serializer = DEFAULT_SERIALIZER_;
	}
	return serializer( theObject );
}

module.exports = { deserialize, serialize };
