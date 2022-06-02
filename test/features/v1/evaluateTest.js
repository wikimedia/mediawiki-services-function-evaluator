'use strict';

const fs = require( 'fs' );
const fetch = require( '../../../lib/fetch.js' );
const assert = require( '../../utils/assert.js' );
const Server = require( '../../utils/server.js' );

const { isVoid, getError, isZMap } = require( '../../../executors/javascript/function-schemata/javascript/src/utils.js' );
const { convertWrappedZObjectToVersionedBinary } = require( '../../../executors/javascript/function-schemata/javascript/src/serialize.js' );

function readJSON( fileName ) {
	return JSON.parse( fs.readFileSync( fileName, { encoding: 'utf8' } ) );
}

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
		const wrappedInput = {
			reentrant: false,
			zobject: input
		};
		const toTest = {
			'serialized version': {
				theInput: convertWrappedZObjectToVersionedBinary( wrappedInput, '0.0.2' ),
				contentType: 'application/octet-stream'
			},
			'raw JSON version': {
				theInput: JSON.stringify( wrappedInput ),
				contentType: 'application/json'
			}
		};
		for ( const key of Object.keys( toTest ) ) {
			const theInput = toTest[ key ].theInput;
			const contentType = toTest[ key ].contentType;
			const testName = `${name}: ${key}`;
			it( testName, async function () { // eslint-disable-line no-undef,no-loop-func
				const fetchedResult = await fetch( uri, {
					method: 'POST',
					body: theInput,
					headers: { 'Content-type': contentType }
				} );
				assert.status( fetchedResult, 200 );
				const jsonRegex = /application\/json/;
				assert.ok( fetchedResult.headers.get( 'Content-type' ).match( jsonRegex ) );
				const Z22 = await fetchedResult.json();
				const Z22K1 = Z22.Z22K1;
				const Z22K2 = Z22.Z22K2;
				if ( expectedOutput !== null ) {
					assert.deepEqual( Z22K1, expectedOutput.Z22K1, name );
					assert.deepEqual( getError( Z22 ), getError( expectedOutput ), name );
					assert.ok( isVoid( Z22K2 ) || isZMap( Z22K2 ) );
				} else {
					const isError = ( isVoid( Z22K1 ) );
					assert.ok( isError );
					// Checks that the error content contains the expected error key phrase.
					const errorMessage = Z22K2.K1.K1.K2.Z5K2.Z6K1;
					assert.ok( errorMessage.includes( expectedErrorKeyPhrase ) );
				}
			} );
		}
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
