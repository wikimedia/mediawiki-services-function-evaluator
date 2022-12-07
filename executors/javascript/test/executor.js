'use strict';

const fs = require( 'fs' );
const Stream = require( 'stream' );
const { execute, main } = require( '../executor.js' );
const { withoutZ1K1s } = require( './utils.js' );
const assert = require( 'chai' ).assert;
const { isVoid, isZMap } = require( '../function-schemata/javascript/src/utils.js' );

function readTestJson( fileName ) {
	return JSON.parse( fs.readFileSync( './test/test_data/' + fileName, { encoding: 'utf8' } ) );
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
		const functionCall = readTestJson( 'javascript_add.json' );
		const functionCallString = JSON.stringify( functionCall );
		const expected = readTestJson( 'add_expected.json' );
		return new Promise( ( resolve ) => {
			const stdin = new Stream.Readable();
			stdin._read = () => {};
			stdout = new Stream.Writable();
			stdout._write = ( chunk ) => {
				stdoutQueue.push( chunk );
				resolve();
			};
			main( stdin, stdout );
			stdin.push( functionCallString );
		} ).then( () => {
			assert.deepEqual( withoutZ1K1s( expected ), withoutZ1K1s( JSON.parse( stdoutQueue.join( '' ) ) ) );
			assert.ok( isVoid( JSON.parse( stdoutQueue.join( '' ) ).Z22K2 ) ||
				isZMap( JSON.parse( stdoutQueue.join( '' ) ).Z22K2 ) );
		} );
	} );

	it( 'test main: syntax failure', () => { // eslint-disable-line no-undef
		const functionCall = readTestJson( 'javascript_syntax_failure.json' );
		const functionCallString = JSON.stringify( functionCall );
		const expected = readTestJson( 'javascript_syntax_failure_expected.json' );
		return new Promise( ( resolve ) => {
			const stdin = new Stream.Readable();
			stdin._read = () => {};
			stdout = new Stream.Writable();
			stdout._write = ( chunk ) => {
				stdoutQueue.push( chunk );
				resolve();
			};
			main( stdin, stdout );
			stdin.push( functionCallString );
		} ).then( () => {
			assert.deepEqual( withoutZ1K1s( expected ), withoutZ1K1s( JSON.parse( stdoutQueue.join( '' ) ) ) );
		} );
	} );

} );

describe( 'JavaScript executor', () => { // eslint-disable-line no-undef

	async function runTest( zobject, expectedResult ) {
		const result = await execute( zobject );
		assert.deepEqual( withoutZ1K1s( expectedResult ), withoutZ1K1s( result ) );
		assert.ok( isVoid( result.Z22K2 ) || isZMap( result.Z22K2 ) );
	}

	it( 'test runs function call', async () => { // eslint-disable-line no-undef
		await runTest(
			readTestJson( 'javascript_add.json' ),
			readTestJson( 'add_expected.json' )
		);
	} );

	it( 'test runs function call with generics', async () => { // eslint-disable-line no-undef
		await runTest(
			readTestJson( 'javascript_add_with_generics.json' ),
			readTestJson( 'add_expected.json' )
		);
	} );

	it( 'test compound type', async () => { // eslint-disable-line no-undef
		await runTest(
			readTestJson( 'javascript_compound_type.json' ),
			readTestJson( 'compound_type_expected.json' )
		);
	} );

	it( 'test list_o_lists_o_strings_input', async () => { // eslint-disable-line no-undef
		const functionCall = {
			functionName: 'Z1000',
			codeString: readTestJson( 'list_list_string_input_javascript_implementation.json' ).Z6K1,
			functionArguments: {
				Z1000K1: readTestJson( 'list_list_strings.json' )
			}
		};
		const expected = readTestJson( 'result_envelope_template.json' );
		expected.Z22K1 = readTestJson( 'string_in_lists.json' );
		await runTest( functionCall, expected );
	} );

	it( 'test list_o_lists_o_strings_output', async () => { // eslint-disable-line no-undef
		const functionCall = {
			functionName: 'Z1000',
			codeString: readTestJson( 'list_list_string_output_javascript_implementation.json' ).Z6K1,
			functionArguments: {
				Z1000K1: readTestJson( 'string_in_lists.json' )
			}
		};
		const expected = readTestJson( 'result_envelope_template.json' );
		expected.Z22K1 = readTestJson( 'list_list_strings.json' );
		await runTest( functionCall, expected );
	} );

	it( 'test list_o_lists_o_strings_output_unspecified', async () => { // eslint-disable-line no-undef
		const functionCall = {
			functionName: 'Z1000',
			codeString: readTestJson( 'list_list_string_output_javascript_implementation.json' ).Z6K1,
			functionArguments: {
				Z1000K1: readTestJson( 'string_in_lists.json' )
			}
		};
		const expected = readTestJson( 'result_envelope_template.json' );
		expected.Z22K1 = readTestJson( 'list_list_strings.json' );
		await runTest( functionCall, expected );
	} );

	it( 'test pair_string_pair_string_string_input', async () => { // eslint-disable-line no-undef
		const functionCall = {
			functionName: 'Z1000',
			codeString: readTestJson( 'pair_string_pair_string_string_input_javascript_implementation.json' ).Z6K1,
			functionArguments: {
				Z1000K1: readTestJson( 'pair_string_pair_string_string.json' )
			}
		};
		const expected = readTestJson( 'result_envelope_template.json' );
		expected.Z22K1 = readTestJson( 'string_in_pairs.json' );
		await runTest( functionCall, expected );
	} );

	it( 'test pair_string_pair_string_string_output', async () => { // eslint-disable-line no-undef
		const functionCall = {
			functionName: 'Z1000',
			codeString: readTestJson( 'pair_string_pair_string_string_output_javascript_implementation.json' ).Z6K1,
			functionArguments: {
				Z1000K1: readTestJson( 'string_in_pairs.json' )
			}
		};
		const expected = readTestJson( 'result_envelope_template.json' );
		expected.Z22K1 = readTestJson( 'pair_string_pair_string_string.json' );
		await runTest( functionCall, expected );
	} );

	it( 'test map_string_string', async () => { // eslint-disable-line no-undef
		const functionCall = readTestJson( 'map_string_string_Z7.json' );
		functionCall.codeString = readTestJson( 'map_string_string_javascript_implementation.json' ).Z6K1;
		functionCall.functionArguments.Z1802K1 = readTestJson( 'map_string_bool.json' );
		const expected = readTestJson( 'result_envelope_template.json' );
		expected.Z22K1 = readTestJson( 'map_string_string.json' );
		await runTest( functionCall, expected );
	} );

	it( 'test user-defined input', async () => { // eslint-disable-line no-undef
		const functionCall = readTestJson( 'javascript_user_defined_input.json' );
		functionCall.functionArguments.Z1000K1 = readTestJson( 'user_defined_input_Z1000K1.json' );
		await runTest( functionCall, readTestJson( 'user_defined_input_expected.json' ) );
	} );

	it( 'test unserializable type', async () => { // eslint-disable-line no-undef
		await runTest(
			readTestJson( 'javascript_unsupported_output.json' ),
			readTestJson( 'javascript_unsupported_output_expected.json' )
		);
	} );

	it( 'test no functionName', async () => { // eslint-disable-line no-undef
		await runTest(
			readTestJson( 'javascript_no_function_name.json' ),
			readTestJson( 'no_function_name_expected.json' )
		);
	} );

	it( 'test no codeString', async () => { // eslint-disable-line no-undef
		await runTest(
			readTestJson( 'javascript_no_code_string.json' ),
			readTestJson( 'no_code_string_expected.json' )
		);
	} );

} );
