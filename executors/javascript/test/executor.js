'use strict';

const fs = require( 'fs' );
const Stream = require( 'stream' );
const { execute, main } = require( '../executor.js' );
const assert = require( 'chai' ).assert;

function readTestJson( fileName ) {
	return JSON.parse( fs.readFileSync( fileName, { encoding: 'utf8' } ) );
}

describe( 'JavaScript executor: main', () => { // eslint-disable-line no-undef

	let stdout;
	let stdoutQueue;

	beforeEach( () => { // eslint-disable-line no-undef
		stdoutQueue = [];
		stdout = new Stream.Writable();
		stdout._write = ( chunk, encoding, next ) => {
			stdoutQueue.push( chunk );
			next();
		};
	} );

	it( 'test main: add', () => { // eslint-disable-line no-undef
		const Z7 = readTestJson( './test/test_data/javascript_add.json' );
		const Z7String = JSON.stringify( { function_call: Z7 } );
		const expected = readTestJson( './test/test_data/add_expected.json' );
		return new Promise( ( resolve ) => {
			const stdin = new Stream.Readable();
			stdin._read = () => {};
			stdout = new Stream.Writable();
			stdout._write = ( chunk ) => {
				stdoutQueue.push( chunk );
				resolve();
			};
			main( stdin, stdout );
			stdin.push( Z7String );
		} ).then( () => {
			assert.deepEqual( expected, JSON.parse( stdoutQueue.join( '' ) ) );
		} );
	} );

	it( 'test main: syntax failure', () => { // eslint-disable-line no-undef
		const Z7 = readTestJson( './test/test_data/javascript_syntax_failure.json' );
		const Z7String = JSON.stringify( { function_call: Z7 } );
		const expected = readTestJson( './test/test_data/javascript_syntax_failure_expected.json' );
		return new Promise( ( resolve ) => {
			const stdin = new Stream.Readable();
			stdin._read = () => {};
			stdout = new Stream.Writable();
			stdout._write = ( chunk ) => {
				stdoutQueue.push( chunk );
				resolve();
			};
			main( stdin, stdout );
			stdin.push( Z7String );
		} ).then( () => {
			assert.deepEqual( expected, JSON.parse( stdoutQueue.join( '' ) ) );
		} );
	} );

} );

describe( 'JavaScript executor', () => { // eslint-disable-line no-undef

	function runTest( zobject, expectedResult ) {
		const result = execute( zobject );
		assert.deepEqual( expectedResult, result );
	}

	it( 'test runs function call', () => { // eslint-disable-line no-undef
		runTest(
			readTestJson( './test/test_data/javascript_add.json' ),
			readTestJson( './test/test_data/add_expected.json' )
		);
	} );

	it( 'test compound type', () => { // eslint-disable-line no-undef
		runTest(
			readTestJson( './test/test_data/javascript_compound_type.json' ),
			readTestJson( './test/test_data/compound_type_expected.json' )
		);
	} );

	it( 'test undeserializable type', () => { // eslint-disable-line no-undef
		runTest(
			readTestJson( './test/test_data/javascript_unsupported_input.json' ),
			readTestJson( './test/test_data/unsupported_input_expected.json' )
		);
	} );

	it( 'test unserializable type', () => { // eslint-disable-line no-undef
		runTest(
			readTestJson( './test/test_data/javascript_unsupported_output.json' ),
			readTestJson( './test/test_data/javascript_unsupported_output_expected.json' )
		);
	} );

	it( 'test no Z8', () => { // eslint-disable-line no-undef
		runTest(
			readTestJson( './test/test_data/javascript_no_Z8.json' ),
			readTestJson( './test/test_data/no_Z8_expected.json' )
		);
	} );

	it( 'test no Z14', () => { // eslint-disable-line no-undef
		runTest(
			readTestJson( './test/test_data/javascript_no_Z14.json' ),
			readTestJson( './test/test_data/no_Z14_expected.json' )
		);
	} );

} );
