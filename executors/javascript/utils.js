'use strict';

const { inspect } = require( 'util' );

class ZPair {
	constructor( K1, K2, originalZ1K1 = null ) {
		this.Z1K1_ = originalZ1K1;
		this.K1 = K1;
		this.K2 = K2;
	}
}

class ZObject {
	constructor( kwargs, originalZ1K1 = null ) {
		this.Z1K1 = originalZ1K1;
		for ( const entry of kwargs.entries() ) {
			this[ entry[ 0 ] ] = entry[ 1 ];
		}
	}
}

function z10ToList( Z10 ) {
	const result = [];
	let tail = Z10;
	while ( true ) {
		const head = tail.Z10K1;
		if ( head === undefined ) {
			break;
		}
		result.push( head );
		tail = tail.Z10K2;
	}
	return result;
}

function listToZ10( theList ) {
	function emptyZ10() {
		return {
			Z1K1: {
				Z1K1: 'Z9',
				Z9K1: 'Z10'
			}
		};
	}
	const result = emptyZ10();
	let tail = result;
	for ( const element of theList ) {
		tail.Z10K1 = element;
		tail.Z10K2 = emptyZ10();
		tail = tail.Z10K2;
	}
	return result;
}

function isString( str ) {
	return typeof str === 'string' || str instanceof String;
}

// TODO(T282891): All isZWhatev functions should use function-schemata.
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
	// I guess this wasn't a very good ZObject.
	throw new Error( `Could not determine type for ${Z4}` );
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
	getZIDForJSType,
	getZID,
	getZObjectType,
	isString,
	isZType,
	listToZ10,
	z10ToList,
	ZObject,
	ZPair
};
