'use strict';

const { spawn } = require( 'child_process' );

function createExecutorSubprocess( binary, args ) {
	const process = spawn( binary, args, { detached: true } );
	process.unref();
	process.stdin.setEncoding( 'utf-8' );
	return process;
}

function runExecutorSubprocess( binary, args ) {
	return createExecutorSubprocess( binary, args );
}

module.exports = { createExecutorSubprocess, runExecutorSubprocess };
