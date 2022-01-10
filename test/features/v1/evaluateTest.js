'use strict';

const fs = require( 'fs' );
const preq = require( 'preq' );
const assert = require( '../../utils/assert.js' );
const Server = require( '../../utils/server.js' );

const subprocess = require( '../../../src/subprocess.js' );
const sinon = require( 'sinon' );

const { SchemaFactory } = require( '../../../function-schemata/javascript/src/schema.js' );

const errorValidator = SchemaFactory.NORMAL().create( 'Z5' );

function Z23() {
	return { Z1K1: 'Z9', Z9K1: 'Z23' };
}

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
				return subprocess.createExecutorSubprocess( 'python3', { args: [ pyFile ] } );
			}
			const stubProcess = sinon.stub( subprocess, 'runExecutorSubprocess' ).callsFake( mockExecutor );

			return preq( {
				method: 'post',
				uri: uri,
				body: {
					Z1K1: 'Z9',
					Z9K1: 'Z1000'
				}
			} )
				.then( ( res ) => {
					assert.status( res, 200 );
					assert.contentType( res, 'application/json' );
					if ( typeof output === 'function' ) {
						assert.ok( output( res.body ), name );
					} else {
						assert.deepEqual( res.body, output, name );
					}
				} )
				.finally( () => {
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
			Z22K2: Z23()
		}
	);

	test(
		'empty on both ends',
		'test_data/empty_on_both_ends.py',
		{
			Z1K1: { Z1K1: 'Z9', Z9K1: 'Z22' },
			Z22K1: Z23(),
			Z22K2: {
				Z1K1: {
					Z1K1: 'Z9',
					Z9K1: 'Z5'
				},
				Z5K1: {
					Z1K1: 'Z6',
					Z6K1: 'Executor returned some nonsense: .'
				}
			}
		}
	);

	it(
		'no output; much errors', function () {
			function mockExecutor() {
				return subprocess.createExecutorSubprocess( 'python3', [ 'test_data/no_output_much_errors.py' ] );
			}
			const stubProcess = sinon.stub( subprocess, 'runExecutorSubprocess' ).callsFake( mockExecutor );

			const expectedZ22K1 = Z23();

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
					assert.ok( !errorValidator.validate( res.body ) );
				} )
				.finally( () => {
					stubProcess.restore();
				} );
		}
	);

} );

describe( 'evaluate-integration', function () {

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
					if ( typeof output === 'function' ) {
						assert.ok( output( res.body ), name );
					} else {
						assert.deepEqual( res.body, output, name );
					}
				} );
		} );
	};

	function readJSON( fileName ) {
		return JSON.parse( fs.readFileSync( fileName, { encoding: 'utf8' } ) );
	}

	integrationTest(
		'python - addition',
		readJSON( './test_data/python3_add.json' ),
		readJSON( './test_data/add_expected.json' )
	);

	integrationTest(
		'python - error: no Z8',
		readJSON( './test_data/python3_no_Z8.json' ),
		( json ) => !errorValidator.validate( json )
	);

	integrationTest(
		'python - error: no Z14',
		readJSON( './test_data/python3_no_Z14.json' ),
		( json ) => !errorValidator.validate( json )
	);

	integrationTest(
		'javascript - addition',
		readJSON( './test_data/javascript_add.json' ),
		readJSON( './test_data/add_expected.json' )
	);

	integrationTest(
		'javascript - error: no Z8',
		readJSON( './test_data/javascript_no_Z8.json' ),
		( json ) => !errorValidator.validate( json )
	);

	integrationTest(
		'javascript - error: no Z14',
		readJSON( './test_data/javascript_no_Z14.json' ),
		( json ) => !errorValidator.validate( json )
	);

} );
