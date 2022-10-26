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

// TODO (T318747): Common config between these keys and function-schemata.
const executors = new Map();
for ( const languageVersion of [
	'javascript-es2020', 'javascript-es2019', 'javascript-es2018', 'javascript-es2017',
	'javascript-es2016', 'javascript-es2015', 'javascript'
] ) {
	executors.set( languageVersion, {
		executable: 'node',
		callArguments: {
			args: [ 'executors/javascript/executor.js' ]
		}
	} );
}
for ( const languageVersion of [
	'python-3-9', 'python-3-8', 'python-3-7', 'python-3', 'python'
] ) {
	executors.set( languageVersion, {
		executable: 'python3',
		callArguments: {
			args: [ 'executors/python3/executor.py' ],
			env: { PYTHONPATH: 'executors' }
		}
	} );
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
