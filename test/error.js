'use strict';

const error = require( '../src/error.js' );

QUnit.module( 'error' );

QUnit.test( 'error without arguments', ( assert ) => {
	assert.deepEqual(
		error( [ 'Z401' ], [ ] ),
		{
			Z1K1: 'Z5',
			Z5K1: {
				Z1K1: 'Z401'
			}
		},
		'error without arguments'
	);
} );

QUnit.test( 'error with one argument', ( assert ) => {
	assert.deepEqual(
		error( [ 'Z401' ], [ 'test' ] ),
		{
			Z1K1: 'Z5',
			Z5K1: {
				Z1K1: 'Z401',
				Z401K1: 'test'
			}
		},
		'error with one argument'
	);
} );

QUnit.test( 'error with two arguments', ( assert ) => {
	assert.deepEqual(
		error( [ 'Z401' ], [ 'test', 'arg' ] ),
		{
			Z1K1: 'Z5',
			Z5K1: {
				Z1K1: 'Z401',
				Z401K1: 'test',
				Z401K2: 'arg'
			}
		},
		'error with two arguments'
	);
} );

QUnit.test( 'error with zobject argument', ( assert ) => {
	assert.deepEqual(
		error( [ 'Z401' ], [ { Z1K1: 'Z7', Z7K1: 'Z31', K1: [ ] } ] ),
		{
			Z1K1: 'Z5',
			Z5K1: {
				Z1K1: 'Z401',
				Z401K1: {
					Z1K1: 'Z7',
					Z7K1: 'Z31',
					K1: []
				}
			}
		}
		,
		'error with zobject argument'
	);
} );

QUnit.test( 'error with numeric argument', ( assert ) => {
	assert.deepEqual(
		error( [ 'Z401' ], [ 1 ] ),
		{
			Z1K1: 'Z5',
			Z5K1: {
				Z1K1: 'Z401',
				Z401K1: 1
			}
		},
		'error with numeric argument'
	);
} );

QUnit.test( 'nested error with two arguments', ( assert ) => {
	assert.deepEqual(
		error( [ 'Z401', 'Z402' ], [ 'arg1', 'arg2' ] ),
		{
			Z1K1: 'Z5',
			Z5K1: {
				Z1K1: 'Z401',
				Z401K1: {
					Z1K1: 'Z402',
					Z402K1: 'arg1',
					Z402K2: 'arg2'
				}
			}
		},
		'nested error with two arguments'
	);
} );
