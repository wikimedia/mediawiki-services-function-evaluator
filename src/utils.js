'use strict';

const utils = {};

utils.is_string = function ( s ) {
	return typeof s === 'string' || s instanceof String;
};

utils.is_array = function ( a ) {
	return Array.isArray( a );
};

utils.is_reference = function ( z ) {
	return z.match( /^[A-Z][1-9]\d*$/ ) !== null;
};

utils.is_type = function ( type, o ) {
	if ( utils.is_string( o.Z1K1 ) ) {
		return o.Z1K1 === type;
	}
	if ( utils.is_type( o.Z1K1, 'Z9' ) ) {
		return o.Z1K1.Z9K1 === type;
	}
	return false;
};

utils.deep_equal = function ( o1, o2 ) {
	return JSON.stringify( o1 ) === JSON.stringify( o2 );
};

module.exports = utils;
