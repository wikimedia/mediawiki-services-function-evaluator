'use strict';
const sUtil = require( '../lib/util' );
const { maybeRunZ7 } = require( '../src/maybeRunZ7.js' );

/**
 * The main router object
 */
const router = sUtil.router();

/**
 * The main application object reported when this module is require()d
 */
let app; // eslint-disable-line no-unused-vars

router.post( '/', async ( req, res ) => {
	const ZObject = req.body;
	const resultTuple = await maybeRunZ7( ZObject );

	// Kill the executor child process if it has survived.
	const childProcess = resultTuple.process;
	if ( childProcess !== null ) {
		try {
			process.kill( childProcess.pid );
		} catch ( error ) { }
	}

	// Return the resulting Z22 to the caller.
	res.json( resultTuple.Z22 );
} );

module.exports = function ( appObj ) {

	app = appObj;

	return {
		path: '/evaluate',
		api_version: 1, // must be a number!
		router: router
	};

};
