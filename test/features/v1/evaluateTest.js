'use strict';

const fs = require( 'fs' );
const preq = require( 'preq' );
const assert = require( '../../utils/assert.js' );
const Server = require( '../../utils/server.js' );

const subprocess = require( '../../../src/subprocess.js' );
const sinon = require( 'sinon' );

const { SchemaFactory } = require( '../../../function-schemata/javascript/src/schema.js' );
const { makeVoid, isVoid, getError, isZMap } = require( '../../../function-schemata/javascript/src/utils.js' );

const errorValidator = SchemaFactory.NORMAL().create( 'Z5' );

function readJSON( fileName ) {
	return JSON.parse( fs.readFileSync( fileName, { encoding: 'utf8' } ) );
}

describe( 'evaluate-unit', function () { // eslint-disable-line no-undef

	this.timeout( 20000 );

	let uri = null;
	const server = new Server();

	before( () => { // eslint-disable-line no-undef
		return server.start()
			.then( () => {
				uri = `${server.config.uri}wikifunctions.org/v1/evaluate/`;
			} );
	} );

	after( () => server.stop() ); // eslint-disable-line no-undef

	const test = ( name, pyFile, output ) => {
		it( name, function () { // eslint-disable-line no-undef
			function mockExecutor() {
				return subprocess.createExecutorSubprocess( 'python3', { args: [ pyFile ] } );
			}

			const stubProcess = sinon.stub( subprocess, 'runExecutorSubprocess' ).callsFake( mockExecutor );

			return preq( {
				method: 'post',
				uri: uri,
				body: readJSON( './test_data/python3_foo.json' )
			} )
				.then( ( res ) => {
					assert.status( res, 200 );
					assert.contentType( res, 'application/json' );
					if ( typeof output === 'function' ) {
						assert.ok( output( res.body ), name );
					} else {
						assert.deepEqual( res.body.Z22K1, output.Z22K1, name );
						assert.deepEqual( getError( res.body ), getError( output ), name );
						assert.ok( isVoid( res.body.Z22K2 ) || isZMap( res.body.Z22K2 ) );
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
			Z22K2: makeVoid()
		}
	);

	test(
		'empty on both ends',
		'test_data/empty_on_both_ends.py',
		{
			Z1K1: { Z1K1: 'Z9', Z9K1: 'Z22' },
			Z22K1: makeVoid(),
			Z22K2: {
				Z1K1: {
					Z1K1: {
						Z1K1: 'Z9',
						Z9K1: 'Z7'
					},
					Z7K1: {
						Z1K1: 'Z9',
						Z9K1: 'Z883'
					},
					Z883K1: {
						Z1K1: 'Z9',
						Z9K1: 'Z6'
					},
					Z883K2: {
						Z1K1: 'Z9',
						Z9K1: 'Z1'
					}
				},
				K1: {
					Z1K1: {
						Z1K1: {
							Z1K1: 'Z9',
							Z9K1: 'Z7'
						},
						Z7K1: {
							Z1K1: 'Z9',
							Z9K1: 'Z881'
						},
						Z881K1: {
							Z1K1: {
								Z1K1: 'Z9',
								Z9K1: 'Z7'
							},
							Z7K1: {
								Z1K1: 'Z9',
								Z9K1: 'Z882'
							},
							Z882K1: {
								Z1K1: 'Z9',
								Z9K1: 'Z6'
							},
							Z882K2: {
								Z1K1: 'Z9',
								Z9K1: 'Z1'
							}
						}
					},
					K1: {
						Z1K1: {
							Z1K1: {
								Z1K1: 'Z9',
								Z9K1: 'Z7'
							},
							Z7K1: {
								Z1K1: 'Z9',
								Z9K1: 'Z882'
							},
							Z882K1: {
								Z1K1: 'Z9',
								Z9K1: 'Z6'
							},
							Z882K2: {
								Z1K1: 'Z9',
								Z9K1: 'Z1'
							}
						},
						K1: {
							Z1K1: 'Z6',
							Z6K1: 'errors'
						},
						K2: {
							Z1K1: {
								Z1K1: 'Z9',
								Z9K1: 'Z5'
							},
							Z5K1: {
								Z1K1: 'Z9',
								Z9K1: 'Z507'
							},
							Z5K2: {
								Z1K1: 'Z6',
								Z6K1: 'Executor returned an empty response.'
							}
						}
					},
					K2: {
						Z1K1: {
							Z1K1: {
								Z1K1: 'Z9',
								Z9K1: 'Z7'
							},
							Z7K1: {
								Z1K1: 'Z9',
								Z9K1: 'Z881'
							},
							Z881K1: {
								Z1K1: {
									Z1K1: 'Z9',
									Z9K1: 'Z7'
								},
								Z7K1: {
									Z1K1: 'Z9',
									Z9K1: 'Z882'
								},
								Z882K1: {
									Z1K1: 'Z9',
									Z9K1: 'Z6'
								},
								Z882K2: {
									Z1K1: 'Z9',
									Z9K1: 'Z1'
								}
							}
						}
					}
				}
			}
		}
	);

	it( // eslint-disable-line no-undef
		'no output; much errors', async function () {
			function mockExecutor() {
				return subprocess.createExecutorSubprocess( 'python3', [ 'test_data/no_output_much_errors.py' ] );
			}

			const stubProcess = sinon.stub( subprocess, 'runExecutorSubprocess' ).callsFake( mockExecutor );

			const expectedZ22K1 = makeVoid();
			const response = await preq( { method: 'post', uri: uri, body: {} } );
			assert.status( response, 200 );
			assert.contentType( response, 'application/json' );
			const Z22 = response.body;
			assert.deepEqual( Z22.Z22K1, expectedZ22K1 );
			assert.ok( !( await errorValidator.validate( response.body ) ) );
			stubProcess.restore();
		}
	);

} );

describe( 'evaluate-integration', function () { // eslint-disable-line no-undef

	this.timeout( 20000 );

	let uri = null;
	const server = new Server();

	before( () => { // eslint-disable-line no-undef
		return server.start()
			.then( () => {
				uri = `${server.config.uri}wikifunctions.org/v1/evaluate/`;
			} );
	} );

	after( () => server.stop() ); // eslint-disable-line no-undef

	const integrationTest = ( name, input, expectedOutput = null, expectedErrorKeyPhrase = '' ) => {
		it( name, async function () { // eslint-disable-line no-undef
			const response = await preq( { method: 'post', uri: uri, body: input } );
			assert.status( response, 200 );
			assert.contentType( response, 'application/json' );
			const Z22K1 = response.body.Z22K1;
			if ( expectedOutput !== null ) {
				assert.deepEqual( response.body.Z22K1, expectedOutput.Z22K1, name );
				assert.deepEqual( getError( response.body ), getError( expectedOutput ), name );
				assert.ok( isVoid( response.body.Z22K2 ) || isZMap( response.body.Z22K2 ) );
			} else {
				const isError = ( isVoid( Z22K1 ) );
				assert.ok( isError );
				// Checks that the error content contains the expected error key phrase.
				const errorMessage = response.body.Z22K2.K1.K1.K2.Z5K2.Z6K1;
				assert.ok( errorMessage.includes( expectedErrorKeyPhrase ) );
			}
		} );
	};

	integrationTest(
		'degenerate function call',
		readJSON( './test_data/degenerate_Z8.json' ),
		// TODO (T292804): Figure out what error this should actually be.
		/* expectedOutput= */ null
	);

	integrationTest(
		'python - addition',
		readJSON( './test_data/python3_add.json' ),
		readJSON( './test_data/add_expected.json' )
	);

	integrationTest(
		'python - addition (with generics)',
		readJSON( './test_data/python3_add_with_generics.json' ),
		readJSON( './test_data/add_expected.json' )
	);

	integrationTest(
		'python - error: no Z8',
		readJSON( './test_data/python3_no_Z8.json' ),
		/* expectedOutput= */ null,
		/* expectedErrorKeyPhrase */ 'Unable to validate function call'
	);

	integrationTest(
		'python - error: no Z14',
		readJSON( './test_data/python3_no_Z14.json' ),
		/* expectedOutput= */ null,
		/* expectedErrorKeyPhrase */ 'Unable to validate function call'

	);

	integrationTest(
		'javascript - addition',
		readJSON( './test_data/javascript_add.json' ),
		readJSON( './test_data/add_expected.json' )
	);

	integrationTest(
		'javascript - addition (with generics)',
		readJSON( './test_data/javascript_add_with_generics.json' ),
		readJSON( './test_data/add_expected.json' )
	);

	integrationTest(
		'javascript - error: no Z8',
		readJSON( './test_data/javascript_no_Z8.json' ),
		/* expectedOutput= */ null,
		/* expectedErrorKeyPhrase */ 'Unable to validate function call'
	);

	integrationTest(
		'javascript - error: no Z14',
		readJSON( './test_data/javascript_no_Z14.json' ),
		/* expectedOutput= */ null,
		/* expectedErrorKeyPhrase */ 'Unable to validate function call'
	);

	integrationTest(
		'javascript - throw',
		readJSON( './test_data/javascript_throw.json' ),
		/* expectedOutput= */ null,
		/* expectedErrorKeyPhrase */ 'Hello, this is a good day to die'
	);

	integrationTest(
		'no implementation - throw',
		readJSON( './test_data/no_implementation_throw.json' ),
		/* expectedOutput= */ null,
		/* expectedErrorKeyPhrase */ 'Unable to find programming language'
	);

	integrationTest(
		'python unsupported version - throw',
		readJSON( './test_data/python_unsupported_version_throw.json' ),
		/* expectedOutput= */ null,
		/* expectedErrorKeyPhrase */ 'No executor found for programming language'
	);

	integrationTest(
		'unsupported language Java - throw',
		readJSON( './test_data/unsupported_language_java_throw.json' ),
		/* expectedOutput= */ null,
		/* expectedErrorKeyPhrase */ 'No executor found for programming language'
	);

} );
