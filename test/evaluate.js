'use strict';

const evaluate = require( '../src/evaluate.js' );
const normalize = require( '../src/normalize.js' );
const canonicalize = require( '../src/canonicalize.js' );

const rep = ( x ) => canonicalize( evaluate( normalize( x ) ) );

QUnit.module( 'evaluate' );

QUnit.test( 'string literal', ( assert ) => {
	assert.deepEqual(
		rep( 'test' ),
		'test',
		'string literal'
	);
} );

QUnit.test( 'call to head', ( assert ) => {
	assert.deepEqual(
		rep(
			{
				Z1K1: 'Z7',
				Z7K1: 'Z31',
				K1: [ 'a' ]
			}
		),
		'a',
		'call to head'
	);
} );
