'use strict';
const sUtil = require( '../lib/util' );
const { maybeRunZ7 } = require( '../src/maybeRunZ7.js' );
const { getWrappedZObjectFromVersionedBinary, getZObjectFromBinary } = require( '../executors/javascript/function-schemata/javascript/src/serialize.js' );

/**
 * The main router object
 */
const router = sUtil.router();

/**
 * The main application object reported when this module is require()d
 */
let app;

async function runFunctionCall( ZObject, res, websocket = null ) {
	const resultTuple = await maybeRunZ7( ZObject, websocket );

	// Kill the executor child process if it has survived.
	const childProcess = resultTuple.process;
	if ( childProcess !== null ) {
		try {
			process.kill( childProcess.pid );
		} catch ( error ) { }
	}

	// Return the resulting Z22 to the caller.
	res.json( resultTuple.Z22 );
}

router.post( '/', async ( req, res ) => {
	const wss = app.wss;
	let ZObject;

	try {
		// Case 1: The ZObject was serialized with version 0.0.1 of the
		// Avro schema, without version information.
		ZObject = getZObjectFromBinary( req.body, '0.0.1' );
	} catch ( err ) {
		try {
			// Case 2: The ZObject was serialized with a subsequent version of the
			// Avro schema.
			ZObject = getWrappedZObjectFromVersionedBinary( req.body );
		} catch ( err ) {
			// Case 3: The ZObject was a bare JSON object.
			// TODO (T320576): Condition this on Content-type header?
			ZObject = req.body;
		}
	}

	let reentrant = false;

	// Also support reentrant mode.
	if ( ZObject.reentrant !== undefined ) {
		reentrant = ZObject.reentrant;
		ZObject = ZObject.zobject;
	}

	if ( reentrant ) {
		wss.once( 'connection', async ( ws ) => {
			await runFunctionCall( ZObject, res, ws );
		} );
	} else {
		await runFunctionCall( ZObject, res );
	}
} );

module.exports = function ( appObj ) {

	app = appObj;

	return {
		path: '/evaluate',
		api_version: 1, // must be a number!
		router: router
	};

};
