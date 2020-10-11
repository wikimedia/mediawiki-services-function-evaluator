'use strict';

const validate = require( '../src/validate.js' );

QUnit.module( 'validate' );

QUnit.test( 'string literal', ( assert ) => {
	assert.deepEqual(
		validate( {
			Z1K1: 'Z6',
			Z6K1: 'test'
		} ),
		[ ],
		'string literal'
	);
} );
