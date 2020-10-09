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

module.exports = utils;
