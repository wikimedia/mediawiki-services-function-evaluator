'use strict';

const sUtil = require( '../lib/util' );
const subprocess = require( '../src/subprocess.js' );
const { validatesAsFunctionCall } = require( '../function-schemata/javascript/src/schema.js' );
const { convertZListToArray, makeMappedResultEnvelope } = require( '../function-schemata/javascript/src/utils.js' );
const { setZMapValue, isVoid, makeEmptyZMap } = require( '../function-schemata/javascript/src/utils' );

/**
 * The main router object
 */
const router = sUtil.router();

/**
 * Ensures there is an entry for the given key / value in the metadata map
 * of the given Z22 / Evaluation result (envelope).  If the envelope has
 * no metadata map, creates one.  If there is already an entry for the given key,
 * overwrites the corresponding value.  Otherwise, creates a new entry.
 * N.B.: May modify the value of Z22K2 and the ZMap's K1 in place.
 *
 * @param {Object} envelope a Z22/Evaluation result, in normal form
 * @param {Object} key a Z6 or Z39 instance, in normal form
 * @param {Object} value a Z1/ZObject, in normal form
 * @return {Object} the updated envelope, in normal form
 */
function setMetadataValue( envelope, key, value ) {
	let zMap = envelope.Z22K2;
	if ( zMap === undefined || isVoid( zMap ) ) {
		const keyType = { Z1K1: 'Z9', Z9K1: 'Z6' };
		const valueType = { Z1K1: 'Z9', Z9K1: 'Z1' };
		zMap = makeEmptyZMap( keyType, valueType );
	}
	zMap = setZMapValue( zMap, key, value );
	envelope.Z22K2 = zMap;
	return envelope;
}

/**
 * The main application object reported when this module is require()d
 */
let app; // eslint-disable-line no-unused-vars

async function maybeRunZ7( ZObject ) {
	const theStatus = await validatesAsFunctionCall( ZObject );
	if ( !theStatus.isValid() ) {
		console.log( theStatus.getParserErrors() );
		// A flattened list of parser errors. Note that they are from different layers of parsing.
		// The first message might be the most useful.
		const parserErrorMessages = theStatus.getParserErrors().map( ( x ) => x.message );
		return {
			process: null,
			Z22: makeMappedResultEnvelope(
				null,
				{
					Z1K1: {
						Z1K1: 'Z9',
						Z9K1: 'Z5'
					},
					Z5K1: theStatus.getZ5().Z5K1,
					Z5K2: {
						Z1K1: 'Z6',
						Z6K1: `Unable to validate function call. Parser errors: ${parserErrorMessages}`
					}
				}
			)
		};
	}

	let programmingLanguage;
	try {
		const implementations = convertZListToArray( ZObject.Z7K1.Z8K4 );
		programmingLanguage = implementations[ 0 ].Z14K3.Z16K1.Z61K1.Z6K1;
	} catch ( e ) {
		return {
			process: null,
			Z22: makeMappedResultEnvelope(
				null,
				{
					Z1K1: {
						Z1K1: 'Z9',
						Z9K1: 'Z5'
					},
					Z5K1: {
						Z1K1: 'Z9',
						// TODO (T310324): Update from this generic evaluation error
						// to a programming-language-specific error.
						Z9K1: 'Z507'
					},
					Z5K2: {
						Z1K1: 'Z6',
						Z6K1: `Unable to find programming language in function call. ${e}`
					}
				}
			)
		};
	}

	const startTime = new Date();

	const executorProcess = subprocess.runExecutorSubprocess( programmingLanguage );
	if ( executorProcess === null ) {
		return {
			process: null,
			Z22: makeMappedResultEnvelope(
				null,
				{
					Z1K1: {
						Z1K1: 'Z9',
						Z9K1: 'Z5'
					},
					Z5K1: {
						Z1K1: 'Z9',
						// TODO (T310324): Update from this generic evaluation error
						// to a programming-language-specific error.
						Z9K1: 'Z507'
					},
					Z5K2: {
						Z1K1: 'Z6',
						Z6K1: `No executor found for programming language ${programmingLanguage}.`
					}
				}
			)
		};
	}

	// Captured stdout will become the resultant ZObject; captured stderr will be logged.
	const stdoutQueue = [];
	executorProcess.stdout.on( 'data', ( data ) => {
		// TODO (T295699): Avoid toString; find a way to merge Buffers.
		stdoutQueue.push( data.toString() );
	} );
	const stdoutPromise = new Promise( ( resolve ) => {
		executorProcess.stdout.on( 'close', () => {
			resolve();
		} );
	} );

	executorProcess.stderr.on( 'data', ( data ) => {
		console.log( data.toString() );
	} );
	const stderrPromise = new Promise( ( resolve ) => {
		executorProcess.stderr.on( 'close', () => {
			resolve();
		} );
	} );

	// Write ZObject to executor process.
	executorProcess.stdin.write( JSON.stringify( { function_call: ZObject } ) );
	executorProcess.stdin.end();

	// Wait until subprocess exits; return the result of function execution.
	await Promise.all( [ stdoutPromise, stderrPromise ] );
	let Z22, errorful;
	const contents = stdoutQueue.join( '' );

	if ( contents ) {
		try {
			Z22 = JSON.parse( contents );
		} catch ( error ) {
			errorful = 'contentful';
		}
	} else {
		errorful = 'empty';
	}

	if ( errorful ) {
		Z22 = makeMappedResultEnvelope(
			null,
			{
				Z1K1: {
					Z1K1: 'Z9',
					Z9K1: 'Z5'
				},
				Z5K1: {
					Z1K1: 'Z9',
					// Generic evaluation error.
					Z9K1: 'Z507'
				},
				Z5K2: {
					Z1K1: 'Z6',
					Z6K1: errorful === 'contentful' ?
						`Executor returned some nonsense: ${contents}.` :
						'Executor returned an empty response.'
				}
			} );

	}

	const endTime = new Date();
	const duration = endTime.getTime() - startTime.getTime();
	const startTimeStr = startTime.toISOString();
	const endTimeStr = endTime.toISOString();
	const durationStr = duration + 'ms';
	Z22 = setMetadataValue( Z22, { Z1K1: 'Z6', Z6K1: 'evaluationStartTime' }, { Z1K1: 'Z6', Z6K1: startTimeStr } );
	Z22 = setMetadataValue( Z22, { Z1K1: 'Z6', Z6K1: 'evaluationEndTime' }, { Z1K1: 'Z6', Z6K1: endTimeStr } );
	Z22 = setMetadataValue( Z22, { Z1K1: 'Z6', Z6K1: 'evaluationDuration' }, { Z1K1: 'Z6', Z6K1: durationStr } );
	console.debug( 'Evaluation start time: ' + startTimeStr );
	console.debug( 'Evaluation end time: ' + endTimeStr );
	console.debug( 'Evaluation duration: ' + durationStr );

	return {
		process: executorProcess,
		Z22: Z22
	};
}

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
