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

QUnit.test( 'nested call to head', ( assert ) => {
	assert.deepEqual(
		rep(
			{
				Z1K1: 'Z7',
				Z7K1: 'Z31',
				K1: [
					{
						Z1K1: 'Z7',
						Z7K1: 'Z31',
						K1: [ 'a' ]
					}
				]
			}
		),
		'a',
		'nested call to head'
	);
} );

QUnit.test( 'call to head using global key', ( assert ) => {
	assert.deepEqual(
		rep(
			{
				Z1K1: 'Z7',
				Z7K1: 'Z31',
				Z31K1: [ 'a' ]
			}
		),
		'a',
		'nested call to head'
	);
} );

QUnit.test( 'call to head on empty list', ( assert ) => {
	assert.deepEqual(
		rep(
			{
				Z1K1: 'Z7',
				Z7K1: 'Z31',
				K1: [
					{
						Z1K1: 'Z7',
						Z7K1: 'Z31',
						K1: [ ]
					}
				]
			}
		).Z5K1.Z1K1,
		'Z413',
		'nested call to head'
	);
} );

QUnit.test( 'call bad reference', ( assert ) => {
	assert.deepEqual(
		rep(
			{
				Z1K1: 'Z9',
				Z9K1: 'Z48573'
			}
		).Z5K1.Z1K1,
		'Z404',
		'call bad reference'
	);
} );
