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
executors.set( 'javascript-es2020', 'node' );
executors.set( 'javascript-es2019', 'node' );
executors.set( 'javascript-es2018', 'node' );
executors.set( 'javascript-es2017', 'node' );
executors.set( 'javascript-es2016', 'node' );
executors.set( 'javascript-es2015', 'node' );
executors.set( 'javascript', 'node' );
executors.set( 'python-3-9', 'python3' );
executors.set( 'python-3-8', 'python3' );
executors.set( 'python-3-7', 'python3' );
executors.set( 'python-3', 'python3' );
executors.set( 'python', 'python3' );

const calls = new Map();
calls.set( 'python3', { args: [ 'executors/python3/executor.py' ], env: { PYTHONPATH: 'executors' } } );
calls.set( 'node', { args: [ 'executors/javascript/executor.js' ] } );

function runExecutorSubprocess( languageVersion ) {
	const executable = executors.get( languageVersion );
	if ( executable === undefined ) {
		return null;
	}
	const callArguments = calls.get( executable );
	if ( callArguments === undefined ) {
		return null;
	}
	return createExecutorSubprocess( executable, callArguments );
}

module.exports = { createExecutorSubprocess, runExecutorSubprocess };
