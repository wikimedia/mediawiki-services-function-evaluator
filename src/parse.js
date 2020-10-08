'use strict';

const error = require( './error.js' );

function parse( str ) {
	try {
		const zobject = JSON.parse( str );
		return zobject;
	} catch ( err ) {
		const m = ( err.name === 'SyntaxError' ) ? err.message : err.name;
		return error( 'Z401', m, str );
	}
}

module.exports = parse;
