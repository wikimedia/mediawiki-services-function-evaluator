'use strict';

const utils = {};

utils.is_string = function ( s ) {
	return typeof s === 'string' || s instanceof String;
};

utils.is_array = function ( a ) {
	return Array.isArray( a );
};

module.exports = utils;
