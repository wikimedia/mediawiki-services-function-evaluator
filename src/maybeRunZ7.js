'use strict';

const { makeMappedResultEnvelope, setMetadataValue } = require( '../executors/javascript/function-schemata/javascript/src/utils.js' );
const os = require( 'os' );
const pidusage = require( 'pidusage' );
const { cpuUsage, memoryUsage } = require( 'node:process' );

async function maybeRunZ7( ZObject, executorProcess, websocket = null ) {
	const startTime = new Date();
	const startUsage = cpuUsage();

	// Captured stdout will become the resultant ZObject; captured stderr will be logged.
	let Z22 = null;
	const stdoutQueue = [];
	executorProcess.stdout.on( 'data', ( data ) => {
		// TODO (T295699): Avoid toString; find a way to merge Buffers.
		data = data.toString();

		if ( data.match( /^\s*call / ) ) {
			// When the data starts with "call ", request a subsequent orchestration
			// via the websocket.
			//
			// If websocket is null (i.e., reentrant mode is disabled), exit
			// early.
			if ( websocket === null ) {
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
							Z6K1: 'Non-reentrant executor tried to call back to the orchestrator'
						}
					} );
				process.kill( executorProcess.pid );
			} else {
				websocket.send( data );
			}
		} else if ( data.replace( /\s/g, '' ) ) {
			// Skip data that contains only whitespaces; all other data becomes
			// part of the eventual result.
			// TODO (T322345): Consider raising an error if stdout only contains
			// whitespace.
			stdoutQueue.push( data );
		}
	} );
	const stdoutPromise = new Promise( ( resolve ) => {
		executorProcess.stdout.on( 'close', () => {
			resolve();
		} );
	} );

	executorProcess.stderr.on( 'data', ( data ) => {
		data = data.toString();
		if ( data.match( /^\s*end/ ) ) {
			executorProcess.stdin.end();
		} else {
			// TODO (T322097): Use a logger; consider whether this should be
			// logged to INFO or ERROR or what.
		}
	} );
	const stderrPromise = new Promise( ( resolve ) => {
		executorProcess.stderr.on( 'close', () => {
			resolve();
		} );
	} );

	if ( websocket !== null ) {
		websocket.on( 'message', ( message ) => {
			executorProcess.stdin.write( message + '\n' );
		} );
	}

	const firstImplementation = ZObject.Z7K1.Z8K4.K1;
	const functionCallRequest = {
		codeString: firstImplementation.Z14K3.Z16K2.Z6K1,
		functionName: ZObject.Z7K1.Z8K5.Z9K1,
		functionArguments: {}
	};
	for ( const key of Object.keys( ZObject ) ) {
		if ( key === 'Z1K1' || key === 'Z7K1' ) {
			continue;
		}
		functionCallRequest.functionArguments[ key ] = ZObject[ key ];
	}

	// Write ZObject to executor process.
	executorProcess.stdin.cork();
	executorProcess.stdin.write( JSON.stringify( functionCallRequest ) );
	executorProcess.stdin.write( '\n' );
	executorProcess.stdin.uncork();
	executorProcess.stdin.write( '\n' );
	executorProcess.stdin.uncork();

	let pidStats;
	// TODO(T313460): Take a closer look at how useful the pidusage results are
	pidusage( executorProcess.pid, function ( err, stats ) {
		if ( err ) {
			console.error( 'pidusage error: ' + err );
			return;
		}
		pidStats = stats;
	} );

	// Wait until subprocess exits; return the result of function execution.
	await Promise.all( [ stdoutPromise, stderrPromise ] );
	pidusage.clear();

	// Z22 may already have been set to an error state. If it hasn't, read the
	// Z22 returned by the executor or generate an error.
	if ( Z22 === null ) {
		let errorful;
		// TODO (T322345): Raise an error if all we ever got from the code executor
		// was whitespace.
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
	}

	const cpuUsageStats = cpuUsage( startUsage );
	const cpuUsageStr = ( ( cpuUsageStats.user + cpuUsageStats.system ) / 1000 ) + ' ms';
	const memoryUsageStr = Math.round( memoryUsage.rss() / 1024 / 1024 * 100 ) / 100 + ' MiB';
	const endTime = new Date();
	const startTimeStr = startTime.toISOString();
	const endTimeStr = endTime.toISOString();
	const durationStr = ( endTime.getTime() - startTime.getTime() ) + ' ms';
	const hostname = os.hostname();
	Z22 = setMetadataValue( Z22, { Z1K1: 'Z6', Z6K1: 'evaluationMemoryUsage' }, { Z1K1: 'Z6', Z6K1: memoryUsageStr } );
	Z22 = setMetadataValue( Z22, { Z1K1: 'Z6', Z6K1: 'evaluationCpuUsage' }, { Z1K1: 'Z6', Z6K1: cpuUsageStr } );
	Z22 = setMetadataValue( Z22, { Z1K1: 'Z6', Z6K1: 'evaluationStartTime' }, { Z1K1: 'Z6', Z6K1: startTimeStr } );
	Z22 = setMetadataValue( Z22, { Z1K1: 'Z6', Z6K1: 'evaluationEndTime' }, { Z1K1: 'Z6', Z6K1: endTimeStr } );
	Z22 = setMetadataValue( Z22, { Z1K1: 'Z6', Z6K1: 'evaluationDuration' }, { Z1K1: 'Z6', Z6K1: durationStr } );
	Z22 = setMetadataValue( Z22, { Z1K1: 'Z6', Z6K1: 'evaluationHostname' }, { Z1K1: 'Z6', Z6K1: hostname } );
	console.debug( 'Evaluation memory usage: ' + memoryUsageStr );
	console.debug( 'Evaluation CPU usage: ' + cpuUsageStr );
	console.debug( 'Evaluation start time: ' + startTimeStr );
	console.debug( 'Evaluation end time: ' + endTimeStr );
	console.debug( 'Evaluation duration: ' + durationStr );
	console.debug( 'Evaluation hostname: ' + hostname );
	if ( pidStats ) {
		const executionMemoryUsageStr = Math.round( pidStats.memory / 1024 / 1024 * 100 ) / 100 + ' MiB';
		const executionCpuUsageStr = pidStats.ctime.toString() + ' μs';
		Z22 = setMetadataValue( Z22, { Z1K1: 'Z6', Z6K1: 'executionMemoryUsage' }, {
			Z1K1: 'Z6',
			Z6K1: executionMemoryUsageStr
		} );
		Z22 = setMetadataValue( Z22, { Z1K1: 'Z6', Z6K1: 'executionCpuUsage' }, {
			Z1K1: 'Z6',
			Z6K1: executionCpuUsageStr
		} );
		console.debug( 'Execution memory usage: ' + executionMemoryUsageStr );
		console.debug( 'Execution CPU usage: ' + executionCpuUsageStr );
	}

	return {
		process: executorProcess,
		Z22: Z22
	};
}

module.exports = { maybeRunZ7 };
