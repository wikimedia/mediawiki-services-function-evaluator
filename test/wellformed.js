const wellformed = require('../src/wellformed.js');

QUnit.module('wellformed');

QUnit.test('simple string is wellformed', assert => {
  assert.equal(wellformed('"test"'), "test", '"test"');
});

QUnit.test('invalid JSON', assert => {
  assert.equal(wellformed('{ bad JSON! Tut, tut.').Z5K1, "Z401", 'invalid JSON');
});

QUnit.test('empty string', assert => {
  assert.equal(wellformed('""'), "", 'empty string');
});

QUnit.test('well formed Z6 string', assert => {
  assert.equal(wellformed('{ "Z1K1": "Z6", "Z6K1": "" }').Z1K1, "Z6", 'well formed Z6 string');
});
