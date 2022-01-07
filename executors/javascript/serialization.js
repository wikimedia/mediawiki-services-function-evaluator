'use strict';

const { getZID, getZIDForJSType, getZObjectType, isString, isZType } = require( './utils.js' );
const { ZObject, ZPair } = require( './utils.js' );
// eslint-disable-next-line node/no-missing-require
const { convertArrayToZList, convertZListToArray } = require( './function-schemata/javascript/src/utils.js' );
const { inspect } = require( 'util' );
const stableStringify = require( 'json-stable-stringify-without-jsonify' );

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

function deserializeZMap( ZObject ) {
	const result = new Map();
	for ( const pair of deserialize( ZObject.K1 ) ) {
		result.set( pair.K1, pair.K2 );
	}
	return result;
}

// TODO(T290898): This can serve as a model for default deserialization--all
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
DESERIALIZERS_.set( 'Z10', deserializeZ10 );
// eslint-disable-next-line no-unused-vars
DESERIALIZERS_.set( 'Z21', ( Z21 ) => null );
DESERIALIZERS_.set( 'Z40', ( Z40 ) => Z40.Z40K1.Z9K1 === 'Z41' );
DESERIALIZERS_.set( 'Z86', ( Z86 ) => Z86.Z86K1.Z6K1 );
DESERIALIZERS_.set( 'Z881', deserializeZList );
DESERIALIZERS_.set( 'Z882', deserializeZPair );
DESERIALIZERS_.set( 'Z883', deserializeZMap );
const DEFAULT_DESERIALIZER_ = deserializeZType;

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
	let deserializer = DESERIALIZERS_.get( ZID );
	if ( deserializer === undefined ) {
		deserializer = DEFAULT_DESERIALIZER_;
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
		result.Z10K1 = serialize( nextElement, { Z1K1: 'Z9', Z9K1: 'Z1' } );
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

function serializeZ86( theCodePoint ) {
	return {
		Z1K1: {
			Z1K1: 'Z9',
			Z9K1: 'Z86'
		},
		Z86K1: {
			Z1K1: 'Z6',
			Z6K1: theCodePoint
		}
	};
}

function soupUpZ1K1( Z1K1 ) {
	if ( isString( Z1K1 ) ) {
		return { Z1K1: 'Z9', Z9K1: Z1K1 };
	}
	return Z1K1;
}

function Z3For( keyType, keyLabel ) {
	return {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z3' },
		Z3K1: keyType,
		Z3K2: { Z1K1: 'Z6', Z6K1: keyLabel },
		Z3K3: { Z1K1: 'Z12', Z12K1: { Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' } } }
	};
}

function serializeZListInternal( elements, expectedType ) {
	function emptyList() {
		return {
			Z1K1: expectedType
		};
	}
	const expectedArgs = convertZListToArray( expectedType.Z4K2 );
	const headKey = expectedArgs[ 0 ].Z3K2.Z6K1;
	const tailKey = expectedArgs[ 1 ].Z3K2.Z6K1;
	const result = emptyList();
	let tail = result;
	for ( const element of elements ) {
		tail[ headKey ] = element;
		tail[ tailKey ] = emptyList();
		tail = tail[ tailKey ];
	}
	return result;
}

function serializeZList( theArray, expectedType ) {
	const expectedArgs = convertZListToArray( expectedType.Z4K2 );
	const headKey = expectedArgs[ 0 ];
	const elements = [];
	for ( const element of theArray ) {
		elements.push( serialize( element, headKey.Z3K1 ) );
	}
	return serializeZListInternal( elements, expectedType );
}

function Z4ForZList( expectedType ) {
	const Z4K1 = {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z7' },
		Z7K1: { Z1K1: 'Z9', Z9K1: 'Z881' },
		Z881K1: expectedType
	};
	const argumentDeclarations = [ Z3For( expectedType, 'K1' ), Z3For( Z4K1, 'K2' ) ];
	return {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z4' },
		Z4K1: Z4K1,
		Z4K2: convertArrayToZList( argumentDeclarations ),
		Z4K3: { Z1K1: 'Z9', Z9K1: 'Z104' }
	};
}

function serializeGenericInternal( expectedType, kwargs ) {
	const result = {
		Z1K1: expectedType
	};
	for ( const entry of kwargs.entries() ) {
		result[ entry[ 0 ] ] = entry[ 1 ];
	}
	return result;
}

// TODO(T290898): This can serve as a model for default deserialization--all
// local keys can be serialized and set as members.
function serializeZType( theObject, expectedType ) {
	const kwargs = new Map();
	if ( isZType( expectedType ) ) {
		const expectedArgs = convertZListToArray( expectedType.Z4K2 );
		for ( const expectedArg of expectedArgs ) {
			const theKey = expectedArg.Z3K2.Z6K1;
			const subType = expectedArg.Z3K1;
			kwargs.set( theKey, serialize( theObject[ theKey ], subType ) );
		}
	} else {
		for ( const key of Object.keys( theObject ) ) {
			if ( key === 'Z1K1' ) {
				continue;
			}
			const subType = { Z1K1: 'Z9', Z9K1: 'Z1' };
			kwargs.set( key, serialize( theObject[ key ], subType ) );
		}
	}
	return serializeGenericInternal( expectedType, kwargs );
}

function Z4ForZPair( firstType, secondType ) {
	const Z4K1 = {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z7' },
		Z7K1: { Z1K1: 'Z9', Z9K1: 'Z882' },
		Z882K1: firstType,
		Z882K2: secondType
	};
	const argumentDeclarations = [ Z3For( firstType, 'K1' ), Z3For( secondType, 'K2' ) ];
	return {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z4' },
		Z4K1: Z4K1,
		Z4K2: convertArrayToZList( argumentDeclarations ),
		Z4K3: { Z1K1: 'Z9', Z9K1: 'Z104' }
	};
}

function serializeZMap( theMap, expectedType ) {
	const pairList = [];
	for ( const entry of theMap.entries() ) {
		pairList.push( new ZPair( ...entry ) );
	}
	const expectedArgs = convertZListToArray( expectedType.Z4K2 );
	const theKey = expectedArgs[ 0 ].Z3K2.Z6K1;
	const subType = expectedArgs[ 0 ].Z3K1;
	const kwargs = new Map();
	kwargs.set( theKey, serialize( pairList, subType ) );
	return serializeGenericInternal( expectedType, kwargs );
}

function Z4ForZMap( keyType, valueType ) {
	const Z4K1 = {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z7' },
		Z7K1: { Z1K1: 'Z9', Z9K1: 'Z883' },
		Z883K1: keyType,
		Z883K2: valueType
	};
	const pairType = Z4ForZPair( keyType, valueType );
	const listPairType = Z4ForZList( pairType );
	const argumentDeclarations = [ Z3For( listPairType, 'K1' ) ];
	return {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z4' },
		Z4K1: Z4K1,
		Z4K2: convertArrayToZList( argumentDeclarations ),
		Z4K3: { Z1K1: 'Z9', Z9K1: 'Z104' }
	};
}

function serializeZ1( theObject ) {
	const ZID = getZIDForJSType( theObject );
	if ( ZID === undefined ) {
		throw new Error( 'Could not serialize input JS object: ' + inspect( theObject ) );
	}
	const Z1Type = { Z1K1: 'Z9', Z9K1: 'Z1' };
	if ( ZID === 'Z881' ) {
		const elements = [];
		for ( const thing of theObject ) {
			elements.push( serialize( thing, Z1Type ) );
		}
		const Z1K1s = new Set();
		for ( const element of elements ) {
			// TODO(T293915): Use ZObjectKeyFactory to create string representations.
			Z1K1s.add( stableStringify( element.Z1K1 ) );
		}
		let elementType;
		if ( Z1K1s.size === 1 ) {
			elementType = soupUpZ1K1( JSON.parse( Z1K1s.values().next().value ) );
		} else {
			elementType = Z1Type;
		}
		return serializeZListInternal( elements, Z4ForZList( elementType ) );
	}
	if ( ZID === 'Z882' ) {
		const kwargs = new Map();
		kwargs.set( 'K1', serialize( theObject.K1, Z1Type ) );
		kwargs.set( 'K2', serialize( theObject.K2, Z1Type ) );
		const Z1K1 = Z4ForZPair( soupUpZ1K1( kwargs.get( 'K1' ).Z1K1 ), soupUpZ1K1( kwargs.get( 'K2' ).Z1K1 ) );
		return serializeGenericInternal( Z1K1, kwargs );
	}
	if ( ZID === 'Z883' ) {
		const pairList = [];
		for ( const entry of theObject.entries() ) {
			pairList.push( new ZPair( ...entry ) );
		}
		const K1 = serialize( pairList, Z1Type );
		const firstPair = K1.K1;
		let keyType, valueType;
		if ( firstPair === undefined ) {
			keyType = Z1Type;
			valueType = Z1Type;
		} else {
			keyType = soupUpZ1K1( firstPair.K1.Z1K1 );
			valueType = soupUpZ1K1( firstPair.K2.Z1K1 );
		}
		const Z1K1 = Z4ForZMap( keyType, valueType );
		const kwargs = new Map( [ [ 'K1', K1 ] ] );
		return serializeGenericInternal( Z1K1, kwargs );
	}
	let Z4;
	if ( ZID === 'DEFAULT' ) {
		Z4 = theObject.Z1K1;
	} else {
		Z4 = { Z1K1: 'Z9', Z9K1: ZID };
	}
	return serialize( theObject, Z4 );
}

const SERIALIZERS_ = new Map();
SERIALIZERS_.set( 'Z1', serializeZ1 );
SERIALIZERS_.set( 'Z6', ( theString ) => {
	return { Z1K1: 'Z6', Z6K1: theString };
} );
SERIALIZERS_.set( 'Z10', serializeZ10 );
SERIALIZERS_.set( 'Z21', serializeZ21 );
SERIALIZERS_.set( 'Z40', serializeZ40 );
SERIALIZERS_.set( 'Z86', serializeZ86 );
SERIALIZERS_.set( 'Z881', serializeZList );
SERIALIZERS_.set( 'Z882', serializeZType );
SERIALIZERS_.set( 'Z883', serializeZMap );
const DEFAULT_SERIALIZER_ = serializeZType;

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
	let ZID;
	try {
		ZID = getZID( expectedType );
	} catch ( error ) {
		throw new Error( 'Could not serialize input JS object: ' + inspect( theObject ) );
	}
	let serializer = SERIALIZERS_.get( ZID );
	if ( serializer === undefined ) {
		serializer = DEFAULT_SERIALIZER_;
	}
	return serializer( theObject, expectedType );
}

module.exports = { deserialize, serialize };
