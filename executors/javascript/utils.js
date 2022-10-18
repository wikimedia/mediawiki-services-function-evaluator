'use strict';

const { inspect } = require( 'util' );
const { isString } = require( './function-schemata/javascript/src/utils.js' );
const stableStringify = require( 'json-stable-stringify-without-jsonify' );

function soupUpZ1K1( Z1K1 ) {
	if ( isString( Z1K1 ) ) {
		return { Z1K1: 'Z9', Z9K1: Z1K1 };
	}
	return Z1K1;
}

// TODO (T282891): All isZWhatev functions should use function-schemata.
function isZReference( Z9 ) {
	return Z9 !== undefined && Z9.Z1K1 === 'Z9' && isString( Z9.Z9K1 );
}

function isZFunctionCall( Z7 ) {
	return Z7 !== undefined && Z7.Z1K1 !== undefined && Z7.Z1K1.Z9K1 === 'Z7';
}

function isZType( Z4 ) {
	return Z4 !== undefined && Z4.Z1K1 !== undefined && Z4.Z1K1.Z9K1 === 'Z4';
}

function isZFunction( Z8 ) {
	return Z8 !== undefined && Z8.Z1K1 !== undefined && Z8.Z1K1.Z9K1 === 'Z8';
}

function getListType( theList ) {
	const Z1K1s = new Set();
	let firstZ1K1;
	for ( const element of theList ) {
		if ( firstZ1K1 === undefined ) {
			firstZ1K1 = element.Z1K1;
		}
		// TODO (T293915): Use ZObjectKeyFactory to create string representations.
		Z1K1s.add( stableStringify( element.Z1K1 ) );
	}
	let elementType;
	if ( Z1K1s.size === 1 ) {
		elementType = soupUpZ1K1( JSON.parse( Z1K1s.values().next().value ) );
	} else {
		elementType = soupUpZ1K1( 'Z1' );
	}
	return elementType;
}

function getZID( Z4 ) {
	if ( isZFunction( Z4 ) ) {
		return getZID( Z4.Z8K5 );
	}
	if ( isZReference( Z4 ) ) {
		return Z4.Z9K1;
	}
	if ( isZFunctionCall( Z4 ) ) {
		return getZID( Z4.Z7K1 );
	}
	if ( isZType( Z4 ) ) {
		return getZID( Z4.Z4K1 );
	}
	if ( isString( Z4 ) ) {
		// If Z4 is a string, original object was a Z6 or a Z9.
		return Z4;
	}
	return null;
}

/**
 * Determine the ZID corresponding to the type of a ZObject.
 *
 * @param {Object} ZObject
 * @return {string} the object's type ZID
 */
function getZObjectType( ZObject ) {
	return getZID( ZObject.Z1K1 );
}

const typeMap = new Map();
typeMap.set( 'String', 'Z6' );
typeMap.set( 'Null', 'Z21' );
typeMap.set( 'Boolean', 'Z40' );
typeMap.set( 'Array', 'Z881' );
typeMap.set( 'Map', 'Z883' );

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
	const inspected = inspect( theObject );
	if ( inspected.startsWith( 'ZPair' ) ) {
		return 'Z882';
	}
	if ( inspected.startsWith( 'ZObject' ) ) {
		return 'DEFAULT';
	}
	const typeRegex = /\[object (\w*)\]/;
	// Object.toString will return [object <TYPE>]; <TYPE> is what we're after.
	const typeString = Object.prototype.toString.call( theObject ).replace( typeRegex, '$1' );
	const ZID = typeMap.get( typeString );
	return ZID;
}

module.exports = {
	getListType,
	getZIDForJSType,
	getZID,
	getZObjectType,
	isString,
	isZType,
	soupUpZ1K1
};
