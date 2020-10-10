'use strict';

const error = require( './error.js' );
const normalize = require( './normalize.js' );
const fs = require( 'fs' );

// given a zid, returns the object
// TODO: cache!!!
function get( zid, meta = false ) {
	// this should be configurable against any path on disc and against any wiki
	// and possible other sources
	// for now, it looks in the data directory of this

	const filename = __dirname + '/../data/' + zid + '.json';
	if ( !fs.existsSync( filename ) ) {
		return error( 'Z404', [ zid ] );
	}

	const result = require( filename );
	if ( meta ) {
		return normalize( result );
	} else {
		// TODO: if there is no Z2K2, return an error
		return normalize( result.Z2K2 );
	}
}

module.exports = get;
