'use strict';

const sUtil = require( '../lib/util' );
const subprocess = require( '../src/subprocess.js' );
const { SchemaFactory } = require( '../function-schemata/javascript/src/schema.js' );
const { convertZListToArray, makeResultEnvelope } = require( '../function-schemata/javascript/src/utils.js' );

/**
 * The main router object
 */
const router = sUtil.router();

/**
 * The main application object reported when this module is require()d
 */
let app; // eslint-disable-line no-unused-vars

async function maybeRunZ7( ZObject ) {
	const schema = SchemaFactory.NORMAL().create( 'Z7_backend' );
	if ( !schema.validate( ZObject ) ) {
		const listOfErrorsType = {
			Z1K1: {
				Z1K1: 'Z9',
				Z9K1: 'Z7'
			},
			Z7K1: {
				Z1K1: 'Z9',
				Z9K1: 'Z881'
			},
			Z881K1: {
				Z1K1: 'Z9',
				Z9K1: 'Z5'
			}
		};
		return {
			process: null,
			Z22: makeResultEnvelope(
				null,
				{
					Z1K1: {
						Z1K1: 'Z9',
						Z9K1: 'Z5'
					},
					Z5K2: schema.errors.reduce( ( errors, error ) => {
						function setEmptyListItemData( list, string ) {
							if ( list.K1 === undefined ) {
								list.K1 = string;
								list.K2 = {
									Z1K1: listOfErrorsType
								};
								return list;
							} else {
								return {
									...list,
									K2: setEmptyListItemData( list.K2, string )
								};
							}
						}

						return setEmptyListItemData( errors, {
							Z1K1: 'Z6',
							Z6K1: `${error.dataPath} ${error.message}.`
						} );
					}, {
						Z1K1: listOfErrorsType
					} )
				}
			)
		};
	}

	let programmingLanguage;
	try {
		const implementations = convertZListToArray( ZObject.Z7K1.Z8K4 );
		programmingLanguage = implementations[ 0 ].Z14K3.Z16K1.Z61K1.Z6K1;
	} catch ( e ) {
		// TODO(T296857): Return error in this case (should be handled by validation).
		programmingLanguage = 'python-3';
	}
	const executorProcess = subprocess.runExecutorSubprocess( programmingLanguage );
	if ( executorProcess === null ) {
		return {
			process: executorProcess,
			Z22: makeResultEnvelope(
				null,
				{
					Z1K1: {
						Z1K1: 'Z9',
						Z9K1: 'Z5'
					},
					Z5K1: {
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
		// TODO(T295699): Avoid toString; find a way to merge Buffers.
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
	let Z22;
	const contents = stdoutQueue.join( '' );
	try {
		Z22 = JSON.parse( contents );
	} catch ( error ) {
		Z22 = makeResultEnvelope(
			null,
			{
				Z1K1: {
					Z1K1: 'Z9',
					Z9K1: 'Z5'
				},
				Z5K1: {
					Z1K1: 'Z6',
					Z6K1: `Executor returned some nonsense: ${contents}.`
				}
			} );
	}

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
