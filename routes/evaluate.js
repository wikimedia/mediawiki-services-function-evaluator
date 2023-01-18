'use strict';
const sUtil = require( '../lib/util' );
const subprocess = require( '../src/subprocess.js' );
const { maybeRunZ7 } = require( '../src/maybeRunZ7.js' );
const { getWrappedZObjectFromVersionedBinary, getZObjectFromBinary } = require( '../executors/javascript/function-schemata/javascript/src/serialize.js' );
const { validatesAsFunctionCall } = require( '../executors/javascript/function-schemata/javascript/src/schema.js' );
const { convertZListToItemArray, makeMappedResultEnvelope } = require( '../executors/javascript/function-schemata/javascript/src/utils.js' );

/**
 * The main router object
 */
const router = sUtil.router();

/**
 * The main application object reported when this module is require()d
 */
let app;

async function propagateResult( res, result, childProcess = null ) {
	// Kill the executor child process if it has survived.
	if ( childProcess !== null ) {
		try {
			process.kill( childProcess.pid );
			childProcess = null;
		} catch ( error ) { }
	}
	res.json( result );
}

async function runFunctionCall( ZObject, childProcess, res, websocket = null ) {
	const resultTuple = await maybeRunZ7( ZObject, childProcess, websocket );

	// Return the resulting Z22 to the caller.
	propagateResult( res, resultTuple.Z22, childProcess );
}

router.post( '/', async ( req, res ) => {

	const wss = app.wss;
	let ZObject;

	setTimeout(
		async function () {
			await propagateResult(
				res,
				makeMappedResultEnvelope(
					null,
					{
						Z1K1: {
							Z1K1: 'Z9',
							Z9K1: 'Z5'
						},
						// TODO (T327275): Figure out what error this should actually be.
						Z5K1: {
							Z1K1: 'Z9',
							Z9K1: 'Z558'
						},
						Z5K2: {
							Z1K1: 'Z6',
							Z6K1: 'Function call timed out'
						}
					}
				)
			);
		},
		// TODO (T325590): Parameterize this.
		15000
	);

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

	const theStatus = await validatesAsFunctionCall( ZObject );
	if ( !theStatus.isValid() ) {
		// A flattened list of parser errors. Note that they are from different layers of parsing.
		// The first message might be the most useful.
		const parserErrorMessages = theStatus.getParserErrors().map( ( x ) => x.message );
		await propagateResult(
			res,
			makeMappedResultEnvelope(
				null,
				{
					Z1K1: {
						Z1K1: 'Z9',
						Z9K1: 'Z5'
					},
					// TODO (T292804): Figure out what error this should actually be.
					Z5K1: theStatus.getZ5().Z5K1,
					Z5K2: {
						Z1K1: 'Z6',
						Z6K1: `Unable to validate function call. Parser errors: ${parserErrorMessages}`
					}
				}
			)
		);
		return;
	}

	let programmingLanguage;
	try {
		const implementations = convertZListToItemArray( ZObject.Z7K1.Z8K4 );
		programmingLanguage = implementations[ 0 ].Z14K3.Z16K1.Z61K1.Z6K1;
	} catch ( e ) {
		await propagateResult(
			res,
			makeMappedResultEnvelope(
				null,
				{
					Z1K1: {
						Z1K1: 'Z9',
						Z9K1: 'Z5'
					},
					Z5K1: {
						Z1K1: 'Z9',
						Z9K1: 'Z558'
					},
					Z5K2: {
						Z1K1: 'Z6',
						Z6K1: `Unable to find programming language in function call. ${e}`
					}
				}
			)
		);
		return;
	}

	const childProcess = subprocess.runExecutorSubprocess( programmingLanguage );
	if ( childProcess === null ) {
		await propagateResult(
			res,
			makeMappedResultEnvelope(
				null,
				{
					Z1K1: {
						Z1K1: 'Z9',
						Z9K1: 'Z5'
					},
					Z5K1: {
						Z1K1: 'Z9',
						Z9K1: 'Z558'
					},
					Z5K2: {
						Z1K1: 'Z6',
						Z6K1: `No executor found for programming language ${programmingLanguage}.`
					}
				}
			)
		);
		return;
	}

	if ( reentrant ) {
		wss.once( 'connection', async ( ws ) => {
			await runFunctionCall( ZObject, childProcess, res, ws );
		} );
	} else {
		await runFunctionCall( ZObject, childProcess, res );
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
