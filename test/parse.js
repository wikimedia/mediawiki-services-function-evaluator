const parse = require('../src/parse.js');

QUnit.module('parse');

QUnit.test('simple string is parse', assert => {
  assert.equal(parse('"test"'), "test", '"test"');
});

QUnit.test('invalid JSON', assert => {
  assert.equal(parse('{ bad JSON! Tut, tut.').Z5K1, "Z401", 'invalid JSON');
});

QUnit.test('empty string', assert => {
  assert.equal(parse('""'), "", 'empty string');
});

QUnit.test('well formed Z6 string', assert => {
  assert.equal(parse('{ "Z1K1": "Z6", "Z6K1": "" }').Z1K1, "Z6", 'well formed Z6 string');
});

QUnit.test('just word', assert => {
  assert.equal(parse('Test').Z5K1, "Z401", 'just word');
});

QUnit.test('empty', assert => {
  assert.equal(parse('Test').Z5K1, "Z401", 'empty');
});

QUnit.test('messy string', assert => {
  assert.equal(parse('"This is a [basic] complicated test {string}!"'), "This is a [basic] complicated test {string}!", 'messy string');
});
// TODO: what about quotes in strings, tabulators and new lines?

QUnit.test('empty list', assert => {
  assert.deepEqual(parse('[]'), [], 'empty list');
});

QUnit.test('string singleton list', assert => {
  assert.deepEqual(parse('["Test"]'), ["Test"], 'string singleton list');
});

QUnit.test('string multiple list', assert => {
  assert.deepEqual(parse('["Test", "Test2" , "Test3"]'), ["Test", "Test2" , "Test3"], 'string multiple list');
});
