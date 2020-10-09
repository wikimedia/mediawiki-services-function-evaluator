'use strict';

// given a zid, returns the object
function get( zid, meta = false ) {
	// this should be configurable against any path on disc and against any wiki
	// and possible other sources
	// for now, it looks in the data directory of this
	
	// TODO: what if nothing is found, return an error
	const result = require( '../data/' + zid + '.json' );
	if ( meta ) {
		return result;
	} else {
		// TODO: if there is no Z2K2, return an error
		return result.Z2K2;
	}
}

module.exports = get;
