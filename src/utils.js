'use strict';

const utils = {};

utils.is_string = function ( s ) {
	return typeof s === 'string' || s instanceof String;
};

module.exports = utils;
