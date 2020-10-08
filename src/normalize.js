'use strict';

const utils = require( './utils.js' );

function is_reference( z ) {
	return z.match( /^[A-Z][1-9]\d*$/ ) !== null;
}

function normalize( o ) {
	if ( utils.is_string( o ) ) {
		if ( is_reference( o ) ) {
			return { Z1K1: 'Z9', Z9K1: o };
		} else {
			return { Z1K1: 'Z6', Z6K1: o };
		}
	}
	if ( o.Z1K1 === 'Z5' && o.Z5K1 === 'Z402' ) {
		return o;
	}
	return o;
}

module.exports = normalize;
