'use strict';

const sUtil = require( '../lib/util' );
const { maybeRunZ7 } = require( '../src/maybeRunZ7.js' );
const { executorConfigurations } = require( '../executorConfigurations.js' ); // eslint-disable-line node/no-missing-require
const { runExecutorSubprocess, setExecutorConfigurations } = require( '../src/subprocess.js' );
const { getWrappedZObjectFromVersionedBinary, getZObjectFromBinary } = require( '../executors/javascript/function-schemata/javascript/src/serialize.js' );
const { error } = require( '../executors/javascript/function-schemata/javascript/src/error.js' );
const { validatesAsFunctionCall } = require( '../executors/javascript/function-schemata/javascript/src/schema.js' );
const { convertZListToItemArray, makeMappedResultEnvelope } = require( '../executors/javascript/function-schemata/javascript/src/utils.js' );

setExecutorConfigurations( executorConfigurations );

/**
 * The main router object
 */
const router = sUtil.router();

/**
 * The main application object reported when this module is require()d
 */
let app;

async function propagateResult( res, result, timer = null, childProcess = null ) {
	if ( res.writableEnded ) {
		return;
	}
	if ( timer !== null ) {
		clearTimeout( timer );
	}

	// Kill the executor child process if it has survived.
	if ( childProcess !== null ) {
		try {
			process.kill( childProcess.pid );
			childProcess = null;
		} catch ( error ) { }
	}
	res.json( result );
}

async function runFunctionCall( ZObject, childProcess, res, timer, websocket = null ) {
	const resultTuple = await maybeRunZ7( ZObject, childProcess, websocket );

	// Return the resulting Z22 to the caller.
	propagateResult( res, resultTuple.Z22, timer, childProcess );
}

router.post( '/', async ( req, res ) => {

	const wss = app.wss;
	let ZObject;

	const timeoutLimit = process.env.FUNCTION_EVALUATOR_TIMEOUT || 15000;

	const timer = setTimeout(
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
		timeoutLimit
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
	}

	if ( ZObject.zobject !== undefined ) {
		ZObject = ZObject.zobject;
	}

	// Get the coding language.

	let codingLanguage, errorString;

	if ( ZObject.codingLanguage === undefined ) {
		// Case 1: Avro schema semver < 0.0.3.
		try {
			const implementations = convertZListToItemArray( ZObject.Z7K1.Z8K4 );
			codingLanguage = implementations[ 0 ].Z14K3.Z16K1.Z61K1.Z6K1;
		} catch ( e ) {
			errorString = e;
		}
	} else {
		// Case 2: Avro schema semver >= 0.0.3.
		codingLanguage = ZObject.codingLanguage;
		errorString = 'codingLanguage not specified';
	}

	// We use ! here because null, undefined, and empty string are all bad values
	// for a programming language (although there's almost certainly an esolang called
	// "").
	if ( !codingLanguage ) {
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
						Z6K1: `Unable to find programming language in function call. ${errorString}`
					}
				}
			),
			timer
		);
		return;
	}

	// Fill out the rest of the function call request.
	const functionCallRequest = {
		codeString: null,
		functionName: null,
		functionArguments: {}
	};
	let theStatus = null;
	const errorMessages = [];
	// Error for Avro schema semvers 0.0.3.
	// TODO (T292804): Figure out what error this should actually be.
	let errorCode = error.error_in_evaluation;

	if ( ZObject.functionName === undefined ) {
		// Case 1: Avro schema semver < 0.0.3.
		theStatus = await validatesAsFunctionCall( ZObject );
		if ( theStatus.isValid() ) {
			try {
				for ( const key of Object.keys( ZObject ) ) {
					if ( key === 'Z1K1' ) {
						continue;
					}
					const value = ZObject[ key ];
					if ( key === 'Z7K1' ) {
						const firstImplementation = value.Z8K4.K1;
						functionCallRequest.codeString = firstImplementation.Z14K3.Z16K2.Z6K1;
						functionCallRequest.functionName = value.Z8K5.Z9K1;
						continue;
					}
					functionCallRequest.functionArguments[ key ] = value;
				}
			} catch ( e ) {
				errorMessages.push( 'Function call did not contain valid Function' );
			}
		} else {
			// Case 2: Avro schema semver >= 0.0.3.
			for ( const parserError of theStatus.getParserErrors() ) {
				errorMessages.push( parserError.message );
			}
			errorCode = theStatus.getZ5().Z5K1;
		}
	} else {
		if ( ZObject.codeString === undefined ) {
			errorMessages.push( 'Request did not supply codeString.' );
		} else {
			functionCallRequest.codeString = ZObject.codeString;
		}
		functionCallRequest.functionName = ZObject.functionName;
		functionCallRequest.functionArguments = ZObject.functionArguments;
	}

	if ( errorMessages.length > 0 ) {
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
					Z5K1: errorCode,
					Z5K2: {
						Z1K1: 'Z6',
						Z6K1: `Unable to validate function call. Parser errors: ${errorMessages}`
					}
				}
			),
			timer
		);
		return;
	}

	// Everything is apparently fine, so see if the coding language has an executor.
	const childProcess = runExecutorSubprocess( codingLanguage );
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
						Z6K1: `No executor found for programming language ${codingLanguage}.`
					}
				}
			),
			timer
		);
		return;
	}

	// Execute the function call.
	if ( reentrant ) {
		wss.once( 'connection', async ( ws ) => {
			await runFunctionCall( functionCallRequest, childProcess, res, timer, ws );
		} );
	} else {
		await runFunctionCall( functionCallRequest, childProcess, res, timer );
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
