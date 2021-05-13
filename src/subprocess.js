'use strict';

const { spawn } = require( 'child_process' );

function createExecutorSubprocess( binary, args ) {
	const process = spawn( binary, args, { detached: true } );
	process.unref();
	process.stdin.setEncoding( 'utf-8' );
	return process;
}

// TODO: Common config between these keys and function-schemata.
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
calls.set( 'python3', [ 'executors/python3/executor.py' ] );
calls.set( 'node', [ 'executors/javascript/executor.js' ] );

function runExecutorSubprocess( languageVersion ) {
	const executable = executors.get( languageVersion );
	if ( executable === undefined ) {
		return null;
	}
	const args = calls.get( executable );
	if ( args === undefined ) {
		return null;
	}
	return createExecutorSubprocess( executable, args );
}

module.exports = { createExecutorSubprocess, runExecutorSubprocess };
