const wellformed = require('../src/wellformed.js');

QUnit.module('wellformed');

QUnit.test('well formed Z6 string', assert => {
  assert.deepEqual(wellformed({ "Z1K1": "Z6", "Z6K1": "" }), { "Z1K1": "Z6", "Z6K1": "" }, 'well formed Z6 string');
});

// TODO: add the following tests from the WikiLambda extension
//			'record singleton list' => [ '[{ "Z1K1": "Test!", "Z2K1": "Test" }]', true ],
//			'record multiple list' => [ '[{ "Z1K1": "Test!", "Z2K1": "Test" },{ "Z1K1": "Test2!", "Z2K1": "Test2?" }]', true ],
//			'invalid record singleton list' => [ '[{ "Z2K1": "Test" }]', false ],
//			'empty record' => [ '{}', false ],
//			'singleton string record' => [ '{ "Z1K1": "Test" }', true ],
//			'singleton string record, no Z1K1 key' => [ '{ "Z2K1": "Test" }', false ],
//			'singleton string record, invalid key' => [ '{ "Z1K ": "Test" }', false ],
//			'string record' => [ '{ "Z1K1": "Test", "Z2K1": "Test" }', true ],
//			'string record with a short key' => [ '{ "Z1K1": "Test", "K1": "Test" }', true ],
//			'string record with invalid key' => [ '{ "Z1K1": "Test", "ZK1": "Test" }', false ],
//			'record with list and sub-record' => [ '{ "Z1K1": ["Test", "Second test"], "Z2K1": { "Z1K1": "Test", "K2": "Test"} }', true ],
//			'record with list and invalid sub-record' => [ '{ "Z1K1": ["Test", "Second test"], "Z2K1": { "K2": "Test"} }', false ],
//			'invalid zobject (int not string/list/record)' => [ '{ "Z1K1": "Test", "Z2K1": 2 }', false ],
//			'invalid zobject (float not string/list/record)' => [ '{ "Z1K1": "Test", "Z2K1": 2.0 }', false ],
