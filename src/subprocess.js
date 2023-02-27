'use strict';

const { spawn } = require( 'child_process' );

function createExecutorSubprocess( binary, callArguments ) {
	const args = callArguments.args;
	const processEnv = {};
	// process.env must be sent to the executor subprocess in order to allow coverage
	// to run properly.
	for ( const key of Object.keys( process.env ) ) {
		processEnv[ key ] = process.env[ key ];
	}
	if ( callArguments.env !== undefined ) {
		for ( const key of Object.keys( callArguments.env ) ) {
			processEnv[ key ] = callArguments.env[ key ];
		}
	}
	const options = { detached: true };
	options.env = processEnv;
	const subProcess = spawn( binary, args, options );
	subProcess.unref();
	subProcess.stdin.setEncoding( 'utf-8' );
	return subProcess;
}

const softwareLanguages = require( '../executors/javascript/function-schemata/data/definitions/softwareLanguages.json' );

const executors = new Map();
for ( const languageVersion in softwareLanguages ) {
	let executorConfig;

	if ( languageVersion.startsWith( 'javascript' ) ) {
		executorConfig = {
			// TODO: This should use a different executable for different versions of Node once we
			// support them (needs said versioned binary to also exist first!).
			executable: 'node',
			callArguments: {
				args: [ 'executors/javascript/executor.js' ]
			}
		};
	} else if ( languageVersion.startsWith( 'python' ) ) {
		executorConfig = {
			// TODO: This should use a different executable for different versions of python once we
			// support them (needs said versioned binary to also exist first!).
			executable: 'python3',
			callArguments: {
				// -u forces std* streams to be unbuffered
				args: [ '-u', 'executors/python3/executor.py' ],
				env: { PYTHONPATH: 'executors' }
			}
		};
	}

	// Only register an executor if we recognised it (e.g. Lua doesn't yet have an executable here)
	if ( executorConfig ) {
		// Register this executor for the given ZID (e.g. 'Z601' or 'Z612')
		executors.set( softwareLanguages[ languageVersion ], executorConfig );

		// Register this executor under the language string (e.g. 'javascript-es5' or 'python-3-5')
		// TODO (T287155): This is a legacy, and we will remove it
		executors.set( languageVersion, executorConfig );
	}
}

function runExecutorSubprocess( languageVersion ) {
	const executableDict = executors.get( languageVersion );
	if ( executableDict === undefined ) {
		return null;
	}
	const { executable, callArguments } = executableDict;
	return createExecutorSubprocess( executable, callArguments );
}

module.exports = { createExecutorSubprocess, runExecutorSubprocess };
