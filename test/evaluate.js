'use strict';

const evaluate = require( '../src/evaluate.js' );
const normalize = require( '../src/normalize.js' );
const canonicalize = require( '../src/canonicalize.js' );
const error = require( '../src/error.js' );

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
		error.nil,
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

QUnit.test( 'evaluate an error', ( assert ) => {
	assert.deepEqual(
		rep(
			{
				Z1K1: 'Z5',
				Z5K1: {
					Z1K1: 'Z404',
					Z404K1: 'Z48573'
				}
			}
		),
		{
			Z1K1: 'Z5',
			Z5K1: {
				Z1K1: 'Z404',
				Z404K1: 'Z48573'
			}
		},
		'should stay unchanged'
	);
} );

QUnit.test( 'is a Z6', ( assert ) => {
	assert.true(
		evaluate.is(
			'Z6',
			normalize( {
				Z1K1: 'Z6',
				Z6K1: 'test'
			} )
		),
		'is a Z6'
	);
} );

QUnit.test( 'is not a Z6', ( assert ) => {
	assert.false(
		evaluate.is(
			'Z6',
			normalize( {
				Z1K1: 'Z9',
				Z9K1: 'Z6'
			} )
		),
		'is not a Z6'
	);
} );

QUnit.test( 'is not a Z1', ( assert ) => {
	assert.false(
		evaluate.is(
			'Z1',
			normalize( {
				Z1K1: 'Z6',
				Z6K1: 'test'
			} )
		),
		'is not a Z1'
	);
} );

QUnit.test( 'is a Z6 as full reference', ( assert ) => {
	assert.true(
		evaluate.is(
			'Z6',
			normalize( {
				Z1K1: {
					Z1K1: 'Z9',
					Z9K1: 'Z6'
				},
				Z6K1: 'test'
			} )
		),
		'is a Z6 as full reference'
	);
} );

QUnit.test( 'is a Z6 as double nested reference', ( assert ) => {
	assert.true(
		evaluate.is(
			'Z6',
			normalize( {
				Z1K1: {
					Z1K1: {
						Z1K1: 'Z9',
						Z9K1: 'Z9'
					},
					Z9K1: 'Z6'
				},
				Z6K1: 'test'
			} )
		),
		'is a Z6 as double nested reference'
	);
} );

QUnit.test( 'is a Z6 with function', ( assert ) => {
	assert.true(
		evaluate.is(
			'Z6',
			normalize( {
				Z1K1: {
					Z1K1: 'Z7',
					Z7K1: 'Z31',
					Z31K1: [ 'Z6' ]
				},
				Z6K1: 'test'
			} )
		),
		'is a Z6 with function'
	);
} );

QUnit.test( 'is a Z6 as full type', ( assert ) => {
	assert.true(
		evaluate.is(
			'Z6',
			normalize( {
				Z1K1: {
					Z1K1: 'Z4',
					Z4K1: 'Z6',
					Z4K2: [
						{
							Z1K1: 'Z3',
							Z3K1: 'Z6',
							Z3K2: 'Z6K1',
							Z3K3: {
								Z1K1: 'Z12',
								Z12K1: [ ]
							}
						}
					]
				},
				Z6K1: 'test'
			} )
		),
		'is a Z6 as full type'
	);
} );

QUnit.test( 'is a Z6 as full type with reference', ( assert ) => {
	assert.true(
		evaluate.is(
			'Z6',
			normalize( {
				Z1K1: {
					Z1K1: 'Z4',
					Z4K1: {
						Z1K1: 'Z9',
						Z9K1: 'Z6'
					},
					Z4K2: [
						{
							Z1K1: 'Z3',
							Z3K1: 'Z6',
							Z3K2: 'Z6K1',
							Z3K3: {
								Z1K1: 'Z12',
								Z12K1: [ ]
							}
						}
					]
				},
				Z6K1: 'test'
			} )
		),
		'is a Z6 as full type with reference'
	);
} );
