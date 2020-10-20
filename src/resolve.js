'use strict';

const error = require( './error.js' );
const normalize = require( './normalize.js' );
const fs = require( 'fs' );

// given a zid, returns the object
// TODO: cache!!!
function resolve( zid, meta = false ) {
	// TODO: this should be configurable against any path on disc and against any wiki
	// and possible other sources
	// for now, it looks in the data directory of this

	const filename = __dirname + '/../data/' + zid + '.json';
	if ( !fs.existsSync( filename ) ) {
		return error( [ error.zid_not_found ], [ zid ] );
	}

	const result = require( filename );
	if ( meta ) {
		return normalize( result );
	} else {
		if ( Object.keys( result ).includes( 'Z2K2' ) ) {
			return normalize( result.Z2K2 );
		} else {
			return error( [ error.resolved_object_without_z2k2 ], [ result ] );
		}
	}
}

module.exports = resolve;
