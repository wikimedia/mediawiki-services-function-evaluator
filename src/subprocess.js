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

const executors = new Map();

function setExecutorConfigurations( executorConfigs ) {
	for ( const entry of executorConfigs.entries() ) {
		executors.set( entry[ 0 ], entry[ 1 ] );
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

module.exports = { runExecutorSubprocess, setExecutorConfigurations };
