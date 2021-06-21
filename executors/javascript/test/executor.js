'use strict';

const fs = require( 'fs' );
const Stream = require( 'stream' );
const { execute, main } = require( '../executor.js' );
const assert = require( 'chai' ).assert;

function readTestJson( fileName ) {
	return JSON.parse( fs.readFileSync( fileName, { encoding: 'utf8' } ) );
}

describe( 'JavaScript executor', () => { // eslint-disable-line no-undef

	let stdout, stderr;
	let stdoutQueue, stderrQueue;

	beforeEach( () => { // eslint-disable-line no-undef
		stdoutQueue = [];
		stdout = new Stream.Writable();
		stdout._write = ( chunk, encoding, next ) => {
			stdoutQueue.push( chunk );
			next();
		};

		stderrQueue = [];
		stderr = new Stream.Writable();
		stderr._write = ( chunk, encoding, next ) => {
			stderrQueue.push( chunk );
			next();
		};
	} );

	function runTest( zobject, expectedResult = null, expectedStderr = null ) {
		execute( zobject, stdout, stderr );
		if ( expectedResult !== null ) {
			assert.deepEqual( expectedResult.Z22K1, JSON.parse( stdoutQueue.join( '' ) ) );
		}
		if ( expectedStderr !== null ) {
			assert.deepEqual( expectedStderr.Z22K2, JSON.parse( stderrQueue.join( '' ) ) );
		}
	}

	it( 'test runs function call', () => { // eslint-disable-line no-undef
		runTest(
			readTestJson( './test/test_data/javascript_add.json' ),
			readTestJson( './test/test_data/add_expected.json' )
		);
	} );

	it( 'test no Z8', () => { // eslint-disable-line no-undef
		runTest(
			readTestJson( './test/test_data/javascript_no_Z8.json' ),
			null,
			readTestJson( './test/test_data/no_Z8_expected.json' )
		);
	} );

	it( 'test no Z14', () => { // eslint-disable-line no-undef
		runTest(
			readTestJson( './test/test_data/javascript_no_Z14.json' ),
			null,
			readTestJson( './test/test_data/no_Z14_expected.json' )
		);
	} );

	it( 'test main', () => { // eslint-disable-line no-undef
		const Z7 = readTestJson( './test/test_data/javascript_add.json' );
		const Z7String = JSON.stringify( { function_call: Z7 } );
		const expected = readTestJson( './test/test_data/add_expected.json' ).Z22K1;
		return new Promise( ( resolve ) => {
			const stdin = new Stream.Readable();
			stdin._read = () => {};
			stdout = new Stream.Writable();
			stdout._write = ( chunk ) => {
				stdoutQueue.push( chunk );
				resolve();
			};
			main( stdin, stdout, stderr );
			stdin.push( Z7String );
		} ).then( () => {
			assert.deepEqual( expected, JSON.parse( stdoutQueue.join( '' ) ) );
		} );
	} );

} );
