'use strict';

const fetch = require( '../../../lib/fetch.js' );
const Server = require( '../../utils/server.js' );
const { evaluatorIntegrationTest } = require( '../../utils/integrationTest.js' );
const { readJSON } = require( '../../../src/fileUtils.js' );

describe( 'python3-v1-integration', function () { // eslint-disable-line no-undef

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

	evaluatorIntegrationTest(
		async function ( requestBody ) {
			return await fetch( uri, requestBody );
		},
		function ( testName, callBack ) {
			it( testName, callBack ); // eslint-disable-line no-undef
		},
		'degenerate function call',
		readJSON( './test_data/degenerate_Z8.json' ),
		// TODO (T292804): Figure out what error this should actually be.
		/* expectedOutput= */ null
	);

	evaluatorIntegrationTest(
		async function ( requestBody ) {
			return await fetch( uri, requestBody );
		},
		function ( testName, callBack ) {
			it( testName, callBack ); // eslint-disable-line no-undef
		},
		'python - addition',
		readJSON( './test_data/python3_add_Z7.json' ),
		readJSON( './test_data/add_expected.json' )
	);

	evaluatorIntegrationTest(
		async function ( requestBody ) {
			return await fetch( uri, requestBody );
		},
		function ( testName, callBack ) {
			it( testName, callBack ); // eslint-disable-line no-undef
		},
		'python - addition (with generics)',
		readJSON( './test_data/python3_add_with_generics_Z7.json' ),
		readJSON( './test_data/add_expected.json' )
	);

	evaluatorIntegrationTest(
		async function ( requestBody ) {
			return await fetch( uri, requestBody );
		},
		function ( testName, callBack ) {
			it( testName, callBack ); // eslint-disable-line no-undef
		},
		'python - error: no Z8',
		readJSON( './test_data/python3_no_Z8.json' ),
		/* expectedOutput= */ null,
		/* expectedErrorKeyPhrase */ 'Unable to validate function call'
	);

	evaluatorIntegrationTest(
		async function ( requestBody ) {
			return await fetch( uri, requestBody );
		},
		function ( testName, callBack ) {
			it( testName, callBack ); // eslint-disable-line no-undef
		},
		'python - error: no Z14',
		readJSON( './test_data/python3_no_Z14.json' ),
		/* expectedOutput= */ null,
		/* expectedErrorKeyPhrase */ 'Unable to validate function call'

	);

	// TODO (T330294): Enable this test and ensure an error is thrown.
	// evaluatorIntegrationTest(
	//    async function ( requestBody ) {
	//        return await fetch( uri, requestBody );
	//    },
	//    function ( testName, callBack ) {
	//        it( testName, callBack ); // eslint-disable-line no-undef
	//    },
	//    'javascript - addition',
	//    readJSON( './test_data/javascript_add_Z7.json' ),
	//    /* expectedOutput= */ null
	// );

	evaluatorIntegrationTest(
		async function ( requestBody ) {
			return await fetch( uri, requestBody );
		},
		function ( testName, callBack ) {
			it( testName, callBack ); // eslint-disable-line no-undef
		},
		'no implementation - throw',
		readJSON( './test_data/no_implementation_throw.json' ),
		/* expectedOutput= */ null,
		/* expectedErrorKeyPhrase */ 'Unable to find programming language'
	);

	evaluatorIntegrationTest(
		async function ( requestBody ) {
			return await fetch( uri, requestBody );
		},
		function ( testName, callBack ) {
			it( testName, callBack ); // eslint-disable-line no-undef
		},
		'python unsupported version - throw',
		readJSON( './test_data/python_unsupported_version_throw.json' ),
		/* expectedOutput= */ null,
		/* expectedErrorKeyPhrase */ 'No executor found for programming language'
	);

	evaluatorIntegrationTest(
		async function ( requestBody ) {
			return await fetch( uri, requestBody );
		},
		function ( testName, callBack ) {
			it( testName, callBack ); // eslint-disable-line no-undef
		},
		'unsupported language Java - throw',
		readJSON( './test_data/unsupported_language_java_throw.json' ),
		/* expectedOutput= */ null,
		/* expectedErrorKeyPhrase */ 'No executor found for programming language'
	);

} );
