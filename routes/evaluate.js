'use strict';

const sUtil = require( '../lib/util' );
const subprocess = require( '../src/subprocess.js' );

/**
 * The main router object
 */
const router = sUtil.router();

/**
 * The main application object reported when this module is require()d
 */
let app; // eslint-disable-line no-unused-vars

/**
 * Creates a Z23 (Nothing).
 *
 * @return {Object} Z23
 */
function Z23() {
	return { Z1K1: { Z1K1: 'Z9', Z9K1: 'Z23' } };
}

/**
 * Creates an empty Z10 (List).
 *
 * @return {Object} Z10
 */
function emptyZ10() {
	return { Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' } };
}

/**
 * Turns an array into a Z10.
 *
 * TODO: Use version in function-schemata.
 *
 * @param {Array} zarray an array of ZObjects
 * @return {Object} a Z10 corresponding to the input array
 */
function arrayToZ10( zarray ) {
	let tail = emptyZ10();
	for ( let index = zarray.length - 1; index >= 0; --index ) {
		tail = {
			Z10K1: zarray[ index ],
			Z10K2: tail,
			...emptyZ10()
		};
	}
	return tail;
}

/**
 * Tries to parse output from an executor as a ZObject; creates an error string if not.
 *
 * @param {string} stringVersion raw output from executor
 * @return {Object} an object like {good: ZObject, bad: error output}
 */
function parseAsZObject( stringVersion ) {
	stringVersion = stringVersion.trim();
	const result = {};

	if ( stringVersion !== '' ) {
		try {
			result.good = JSON.parse( stringVersion );
		} catch ( e ) {
			result.bad = { Z1K1: 'Z6', Z6K1: stringVersion };
		}
	}
	return result;
}

router.post( '/', async ( req, res ) => {
	const ZObject = { function_call: req.body };

	// TODO: Condition this on the requested coding language; send error if
	// not supported.
	// TODO: If possible, executor processes should be spun up on server start
	// and stored in app.settings.
	const executorProcess = subprocess.runExecutorSubprocess(
		'python3',
		[ 'executors/python3/executor.py' ]
	);

	// Set up two promises to capture all stdout/stderr in the subprocess.
	const stdoutQueue = [], stderrQueue = [];
	executorProcess.stdout.on( 'data', ( data ) => {
		// TODO: Avoid toString; find a way to merge Buffers.
		stdoutQueue.push( data.toString() );
	} );
	const stdoutPromise = new Promise( ( resolve ) => {
		executorProcess.stdout.on( 'close', () => {
			resolve( stdoutQueue.join( '' ) );
		} );
	} );

	executorProcess.stderr.on( 'data', ( data ) => {
		stderrQueue.push( data.toString() );
	} );
	const stderrPromise = new Promise( ( resolve ) => {
		executorProcess.stderr.on( 'close', () => {
			resolve( stderrQueue.join( '' ) );
		} );
	} );

	// Assemble the output pair <function call result, error>.
	Promise.all( [ stdoutPromise, stderrPromise ] ).then( ( values ) => {
		const zobjects = values.map( parseAsZObject );
		let goodResult = null, badResult = null;
		const errorList = [];

		for ( let i = 0; i < zobjects.length; ++i ) {
			const zobject = zobjects[ i ];
			if ( zobject.bad !== undefined ) {
				errorList.push( zobject.bad );
			} else if ( zobject.good !== undefined ) {
				if ( i === 0 ) {
					goodResult = zobject.good;
				} else {
					errorList.push( zobject.good.Z5K2 );
				}
			}
		}

		if ( errorList.length > 0 ) {
			// TODO: Reconcile this with error handling in function-schemata.
			badResult = {
				Z1K1: {
					Z1K1: 'Z9',
					Z9K1: 'Z5'
				},
				Z5K2: arrayToZ10( errorList )
			};
		}

		res.json( {
			Z1K1: {
				Z1K1: 'Z9',
				Z9K1: 'Z22'
			},
			Z22K1: goodResult || Z23(),
			Z22K2: badResult || Z23()
		} );
	} );

	// Write ZObject to executor process.
	executorProcess.stdin.write( JSON.stringify( ZObject ) );
	executorProcess.stdin.end();
} );

module.exports = function ( appObj ) {

	app = appObj;

	return {
		path: '/evaluate',
		api_version: 1, // must be a number!
		router: router
	};

};
