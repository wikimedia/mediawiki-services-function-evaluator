'use strict';

const assert = require( './assert.js' );

const { isVoid, getError, isZMap } = require( '../../executors/javascript/function-schemata/javascript/src/utils.js' );
const { convertWrappedZObjectToVersionedBinary } = require( '../../executors/javascript/function-schemata/javascript/src/serialize.js' );

function evaluatorIntegrationTest(
	fetch, testRunner, name, input, expectedOutput = null, expectedErrorKeyPhrase = ''
) {
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
		testRunner( testName, async function () {
			const fetchedResult = await fetch( {
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
}

module.exports = {
	evaluatorIntegrationTest
};
