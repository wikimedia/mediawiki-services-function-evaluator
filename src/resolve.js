'use strict';

const error = require( './error.js' );
const config = require( './config.js' );
const normalize = require( './normalize.js' );
const fs = require( 'fs' );
const path = require( 'path' );

function load( zid ) {
	if ( config.repository.startsWith( 'http' ) ) {
		const url = config.repository + zid;
		// TODO: turn this to async
		const request = require( 'sync-request' );
		// TODO: get user agent from configuration
		const res = request( 'GET', url, {
			qs: {
				action: 'raw'
			},
			headers: {
				'user-agent': 'function-evaluator'
			}
		} );
		return JSON.parse( res.getBody() );
	} else {
		const filename = path.resolve( config.repository, zid + '.json' );
		if ( !fs.existsSync( filename ) ) {
			return error( [ error.zid_not_found ], [ zid ] );
		}
		return require( filename );
	}
}

// given a zid, returns the object
// TODO: cache!!!
function resolve( zid, meta = false ) {
	const result = load( zid );
	if ( result.Z1K1 === 'Z5' ) {
		return result;
	}

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
