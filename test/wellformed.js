'use strict';

const wellformed = require( '../src/wellformed.js' );
const error = require( '../src/error.js' );

QUnit.module( 'wellformed' );

QUnit.test( 'well formed Z6 string', ( assert ) => {
	assert.deepEqual( wellformed( { Z1K1: 'Z6', Z6K1: '' } ), { Z1K1: 'Z6', Z6K1: '' }, 'well formed Z6 string' );
} );

QUnit.test( 'empty string', ( assert ) => {
	assert.equal( wellformed( '' ), '', 'empty string' );
} );

QUnit.test( 'messy string', ( assert ) => {
	assert.equal( wellformed( 'This is a [basic] complicated test {string}!' ), 'This is a [basic] complicated test {string}!', 'messy string' );
} );
// TODO: what about quotes in strings, tabulators and new lines?

QUnit.test( 'empty list', ( assert ) => {
	assert.deepEqual( wellformed( [] ), [], 'empty list' );
} );

QUnit.test( 'string singleton list', ( assert ) => {
	assert.deepEqual( wellformed( [ 'Test' ] ), [ 'Test' ], 'string singleton list' );
} );

QUnit.test( 'string multiple list', ( assert ) => {
	assert.deepEqual( wellformed( [ 'Test', 'Test2', 'Test3' ] ), [ 'Test', 'Test2', 'Test3' ], 'string multiple list' );
} );

QUnit.test( 'record singleton list', ( assert ) => {
	assert.deepEqual( wellformed( [ { Z1K1: 'Z60', Z2K1: 'Test' } ] ), [ { Z1K1: 'Z60', Z2K1: 'Test' } ], 'record singleton list' );
} );

QUnit.test( 'record multiple list with error', ( assert ) => {
	assert.deepEqual( wellformed( [ { Z1K1: 'Z6', Z2K1: 'Test' }, { Z1K1: 'Test2!', Z2K1: 'Test2?' } ] ).Z5K1, error.not_wellformed, 'record mutiple list with error' );
} );

QUnit.test( 'record multiple list', ( assert ) => {
	assert.deepEqual(
		wellformed( [ { Z1K1: 'Z60', Z2K1: 'Test' }, { Z1K1: { Z1K1: 'Z7', Z7K1: 'Z10' }, Z2K1: 'Test2?' } ] ),
		[ { Z1K1: 'Z60', Z2K1: 'Test' }, { Z1K1: { Z1K1: 'Z7', Z7K1: 'Z10' }, Z2K1: 'Test2?' } ],
		'record mutiple list'
	);
} );

QUnit.test( 'invalid record singleton list', ( assert ) => {
	assert.deepEqual( wellformed( [ { Z2K1: 'Test' } ] ).Z5K1, error.not_wellformed, 'invalid record singleton list' );
} );

QUnit.test( 'empty record', ( assert ) => {
	assert.deepEqual( wellformed( {} ).Z5K1, error.not_wellformed, 'empty record' );
} );

QUnit.test( 'singleton string record', ( assert ) => {
	assert.deepEqual( wellformed( { Z1K1: 'Z1' } ), { Z1K1: 'Z1' }, 'singleton string record' );
} );

QUnit.test( 'singleton string record no Z1K1', ( assert ) => {
	assert.deepEqual( wellformed( { Z2K1: 'Z1' } ).Z5K1, error.not_wellformed, 'singleton string record no Z1K1' );
} );

QUnit.test( 'singleton string record invalid key', ( assert ) => {
	assert.deepEqual( wellformed( { 'Z1K ': 'Z1' } ).Z5K1, error.not_wellformed, 'singleton string record no Z1K1' );
} );

QUnit.test( 'string record', ( assert ) => {
	assert.deepEqual( wellformed( { Z1K1: 'Z6', Z6K1: 'Test' } ), { Z1K1: 'Z6', Z6K1: 'Test' }, 'string record' );
} );

QUnit.test( 'string record with short key', ( assert ) => {
	assert.deepEqual(
		wellformed( { Z1K1: 'Z6', K1: 'Test' } ),
		{ Z1K1: 'Z6', K1: 'Test' },
		'string record with short key'
	);
} );

QUnit.test( 'string record with invalid key', ( assert ) => {
	assert.deepEqual( wellformed( { Z1K1: 'Z6', ZK1: 'Test' } ).Z5K1, error.not_wellformed, 'string record with invalid key' );
} );

QUnit.test( 'record with list and sub-record', ( assert ) => {
	assert.deepEqual(
		wellformed( { Z1K1: 'Z8', K2: [ 'Test', 'Second test' ], Z2K1: { Z1K1: 'Z60', K2: 'Test' } } ),
		{ Z1K1: 'Z8', K2: [ 'Test', 'Second test' ], Z2K1: { Z1K1: 'Z60', K2: 'Test' } },
		'record with list and sub-record'
	);
} );

QUnit.test( 'record with list and invalid sub-record', ( assert ) => {
	assert.deepEqual(
		wellformed( { Z1K1: 'Z8', K2: [ 'Test', 'Second test' ], Z2K1: { K2: 'Test' } } ).Z5K1, error.not_wellformed,
		'record with list and invalid sub-record'
	);
} );

QUnit.test( 'invalid zobject (int not string/list/record)', ( assert ) => {
	assert.deepEqual( wellformed( { Z1K1: 'Z2', Z2K1: 2 } ).Z5K1, error.not_wellformed, 'invalid zobject (int not string/list/record)' );
} );

QUnit.test( 'invalid zobject (float not string/list/record)', ( assert ) => {
	assert.deepEqual( wellformed( { Z1K1: 'Z2', Z2K1: 2.0 } ).Z5K1, error.not_wellformed, 'invalid zobject (float not string/list/record)' );
} );

QUnit.test( 'number in array', ( assert ) => {
	assert.deepEqual( wellformed( [ 2 ] ).Z5K1, error.not_wellformed, 'number in array' );
} );
