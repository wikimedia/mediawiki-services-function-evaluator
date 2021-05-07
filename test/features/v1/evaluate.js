'use strict';

const fs = require( 'fs' );
const preq = require( 'preq' );
const assert = require( '../../utils/assert.js' );
const Server = require( '../../utils/server.js' );

const subprocess = require( '../../../src/subprocess.js' );
const sinon = require( 'sinon' );

describe( 'evaluate-unit', function () {

	this.timeout( 20000 );

	let uri = null;
	const server = new Server();

	before( () => {
		return server.start()
			.then( () => {
				uri = `${server.config.uri}wikifunctions.org/v1/evaluate/`;
			} );
	} );

	after( () => server.stop() );

	const test = ( name, pyFile, output ) => {
		it( name, function () {
			function mockExecutor() {
				return subprocess.createExecutorSubprocess( 'python3', [ pyFile ] );
			}
			const stubProcess = sinon.stub( subprocess, 'runExecutorSubprocess' ).callsFake( mockExecutor );

			return preq( {
				method: 'post',
				uri: uri,
				body: {}
			} )
				.then( ( res ) => {
					assert.status( res, 200 );
					assert.contentType( res, 'application/json' );
					assert.deepEqual( res.body, output, name );
					stubProcess.restore();
				} );
		} );
	};

	test(
		'good output; no errors',
		'test_data/good_output_no_errors.py',
		{
			Z1K1: { Z1K1: 'Z9', Z9K1: 'Z22' },
			Z22K1: { Z1K1: 'Z6', Z6K1: 'well-behaved' },
			Z22K2: { Z1K1: { Z1K1: 'Z9', Z9K1: 'Z23' } }
		}
	);

	test(
		'empty on both ends',
		'test_data/empty_on_both_ends.py',
		{
			Z1K1: { Z1K1: 'Z9', Z9K1: 'Z22' },
			Z22K1: { Z1K1: { Z1K1: 'Z9', Z9K1: 'Z23' } },
			Z22K2: { Z1K1: { Z1K1: 'Z9', Z9K1: 'Z23' } }
		}
	);

	it(
		'no output; much errors', function () {
			function mockExecutor() {
				return subprocess.createExecutorSubprocess( 'python3', [ 'test_data/no_output_much_errors.py' ] );
			}
			const stubProcess = sinon.stub( subprocess, 'runExecutorSubprocess' ).callsFake( mockExecutor );

			const expectedZ22K1 = { Z1K1: { Z1K1: 'Z9', Z9K1: 'Z23' } };

			function Z10ToStringArray( Z10 ) {
				const result = [];
				while ( Z10.Z10K1 !== undefined ) {
					result.push( Z10.Z10K1.Z6K1 );
					Z10 = Z10.Z10K2;
				}
				return result;
			}

			const expectedErrors = [ 'facinorous output', 'i am very bad too' ];

			return preq( {
				method: 'post',
				uri: uri,
				body: {}
			} )
				.then( ( res ) => {
					assert.status( res, 200 );
					assert.contentType( res, 'application/json' );
					const Z22 = res.body;
					assert.deepEqual( Z22.Z22K1, expectedZ22K1 );

					const errorStrings = Z10ToStringArray( Z22.Z22K2.Z5K2 );
					assert.deepEqual( errorStrings.length, expectedErrors.length );
					for ( const error of expectedErrors ) {
						assert.notDeepEqual( -1, errorStrings.indexOf( error ) );
					}
					stubProcess.restore();
				} );
		}
	);

} );

describe( 'evaluate-integration-python3', function () {

	this.timeout( 20000 );

	let uri = null;
	const server = new Server();

	before( () => {
		return server.start()
			.then( () => {
				uri = `${server.config.uri}wikifunctions.org/v1/evaluate/`;
			} );
	} );

	after( () => server.stop() );

	const integrationTest = ( name, input, output ) => {
		it( name, function () {
			return preq( {
				method: 'post',
				uri: uri,
				body: input
			} )
				.then( ( res ) => {
					assert.status( res, 200 );
					assert.contentType( res, 'application/json' );
					assert.deepEqual( res.body, output, name );
				} );
		} );
	};

	function readJSON( fileName ) {
		return JSON.parse( fs.readFileSync( fileName, { encoding: 'utf8' } ) );
	}

	integrationTest(
		'addition',
		readJSON( './test_data/python3_add.json' ),
		readJSON( './test_data/python3_add_expected.json' )
	);

	integrationTest(
		'error: no Z8',
		readJSON( './test_data/python3_no_Z8.json' ),
		readJSON( './test_data/python3_no_Z8_expected_list.json' )
	);

	integrationTest(
		'error: no Z14',
		readJSON( './test_data/python3_no_Z14.json' ),
		readJSON( './test_data/python3_no_Z14_expected_list.json' )
	);

} );
