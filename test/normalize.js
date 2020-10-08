'use strict';

const normalize = require( '../src/normalize.js' );

QUnit.module( 'normalize' );

QUnit.test( 'simple string', ( assert ) => {
	assert.deepEqual( normalize( 'ab' ), { Z1K1: 'Z6', Z6K1: 'ab' }, 'simple string' );
} );

/* Tests from the php repo
			'empty list' => [ '[]', '[]' ],
			'list with empty string' => [ '[""]', '[""]' ],
			'list with two empty strings' => [ '["", ""]', '["", ""]' ],
			'list with ordered strings' => [ '["a", "b"]', '["a", "b"]' ],
			'list with unordered strings' => [ '["b", "a"]', '["b", "a"]' ],
			'list with lists' => [ '[[],[[]], []]', '[[],[[]],[]]' ],
			'empty string' => [ '""', '""' ],
			'string' => [ '"ab"', '"ab"' ],
			'string unordered' => [ '"ba"', '"ba"' ],
			'untrimmed string left' => [ '" a"', '" a"' ],
			'untrimmed string right' => [ '"a "', '"a "' ],
			'untrimmed string left two' => [ '"  a"', '"  a"' ],
			'untrimmed string both' => [ '" a "', '" a "' ],
			'empty record' => [ '{ "Z1K1": "Z1" }', '{ "Z1K1": "Z1" }' ],
			'simple record' => [
				'{ "Z1K1": "Z60", "Z60K1": "a" }',
				'{ "Z1K1": "Z60", "Z60K1": "a" }'
			],
			'simple record with left untrimmed key' => [
				'{ "Z1K1": "Z60", " Z60K1": "a" }',
				'{ "Z1K1": "Z60", "Z60K1": "a" }'
			],
			'simple record with right untrimmed key' => [
				'{ "Z1K1": "Z60", "Z60K1 ": "a" }',
				'{ "Z1K1": "Z60", "Z60K1": "a" }'
			],
			'simple record with both untrimmed key' => [
				'{ "Z1K1": "Z60", " Z60K1 ": "a" }',
				'{ "Z1K1": "Z60", "Z60K1": "a" }'
			],
			'simple record with left double untrimmed key' => [
				'{ "Z1K1": "Z60", "  Z60K1": "a" }',
				'{ "Z1K1": "Z60", "Z60K1": "a" }'
			],
			'simple record with both keys untrimmed' => [
				'{ " Z1K1 ": "Z60", "Z60K1 ": "a" }',
				'{ "Z1K1": "Z60", "Z60K1": "a" }'
			],
			'simple record with left local untrimmed key' => [
				'{ "Z1K1": "Z60", " K1": "a" }',
				'{ "Z1K1": "Z60", "K1": "a" }'
			],
			'record with embedded record with key untrimmed' => [
				'{ "Z1K1 ": "Z60", "Z60K1 ": { "Z1K1": "Z60", "Z60K1 ": "a" } }',
				'{ "Z1K1": "Z60", "Z60K1": { "Z1K1": "Z60", "Z60K1": "a" } }',
			],
			'list with record with key untrimmed' => [
				'[{ " Z1K1 ": "Z60", "Z60K1 ": "a" }]',
				'[{ "Z1K1": "Z60", "Z60K1": "a" }]'
			],
			'simple record with unsorted keys' => [
				'{ "Z60K1": "a", "Z1K1 ": "Z60" }',
				'{ "Z1K1": "Z60", "Z60K1": "a" }'
			],
			'simple record with unsorted local keys' => [
				'{ "K1 ": "a", "Z1K1 ": "Z60" }',
				'{ "Z1K1": "Z60", "K1": "a" }'
			],
			'escaped string' => [
				'{ "Z1K1": "Z6", "Z6K1": "Z6" }',
				'{ "Z1K1": "Z6", "Z6K1": "Z6" }'
			],
			'unneccessary escaped string' => [
				'{ "Z1K1": "Z6", "Z6K1": "Z" }',
				'"Z"'
			],
			'escaped string QID' => [
				'{ "Z1K1": "Z6", "Z6K1": "Q42" }',
				'{ "Z1K1": "Z6", "Z6K1": "Q42" }'
			],
			'unneccessary escaped string key' => [
				'{ "Z1K1": "Z6", "Z6K1": "Z1K1" }',
				'"Z1K1"'
			],
			'unneccessary escaped string with whitespace' => [
				'{ "Z1K1": "Z6", "Z6K1": " Z1" }',
				'" Z1"'
			],
			'unneccessary double escaped string' => [
				'{ "Z1K1": "Z6", "Z6K1": { "Z1K1": "Z6", "Z6K1": "Z" } }',
				'"Z"'
			],
			'string with wrong key' => [
				'{ "Z1K1": "Z6", "Z6K2": "Z" }',
				'{ "Z1K1": "Z6", "Z6K2": "Z" }'
			],
			'string with no type' => [
				'{ "Z6K1": "Z" }',
				'{ "Z6K1": "Z" }'
			],
			'array with escaped string' => [
				'[{ "Z1K1": "Z6", "Z6K1": "Z6" }, { "Z1K1": "Z6", "Z6K1": "Z" }]',
				'[{ "Z1K1": "Z6", "Z6K1": "Z6" }, "Z" ]'
			],
			'object with escaped string' => [
				'{ "Z1K1": "Z2", "Z2K2": { "Z1K1": "Z6", "Z6K1": "Z6" } }',
				'{ "Z1K1": "Z2", "Z2K2": { "Z1K1": "Z6", "Z6K1": "Z6" } }'
			],
			'object with unneccessarily escaped string' => [
				'{ "Z1K1": "Z2", "Z2K2": { "Z1K1": "Z6", "Z6K1": "Z" } }',
				'{ "Z1K1": "Z2", "Z2K2": "Z" }'
			],
			'explicit reference' => [
				'{ "Z1K1": "Z2", "Z2K2": { "Z1K1": "Z9", "Z9K1": "Z1" } }',
				'{ "Z1K1": "Z2", "Z2K2": "Z1" }'
			],
			'implicit reference' => [
				'{ "Z1K1": "Z2", "Z2K2": "Z1" }',
				'{ "Z1K1": "Z2", "Z2K2": "Z1" }'
			],
			'explicit QID reference' => [
				'{ "Z1K1": "Z2", "Z2K2": { "Z1K1": "Z9", "Z9K1": "Q96807071" } }',
				'{ "Z1K1": "Z2", "Z2K2": "Q96807071" }'
			],
			'invalid reference' => [
				'{ "Z1K1": "Z2", "Z2K2": { "Z1K1": "Z9", "Z9K1": "ZObject" } }',
				'{ "Z1K1": "Z2", "Z2K2": { "Z1K1": "Z9", "Z9K1": "ZObject" } }'
			],
			'empty list as array' => [
				'[]', '[]'
			],
			'empty list as ZObject' => [
				'{ "Z1K1": "Z10" }', '[]'
			],
			'single string in list as array' => [
				'["a"]', '["a"]'
			],
			'single string in list as ZObject' => [
				'{ "Z1K1": "Z10", "Z10K1": "a" }', '["a"]'
			],
			'single string in list as ZObject, tail empty array' => [
				'{ "Z1K1": "Z10", "Z10K1": "a", "Z10K2": [] }', '["a"]'
			],
			'single string in list as ZObject, tail ZObject' => [
				'{ "Z1K1": "Z10", "Z10K1": "a", "Z10K2": { "Z1K1": "Z10" } }',
				'["a"]'
			],
			'two strings in list as array' => [
				'["a", "b"]', '["a", "b"]'
			],
			'two strings in list as ZObject, tail as array' => [
				'{ "Z1K1": "Z10", "Z10K1": "a", "Z10K2": ["b"] }',
				'["a", "b"]'
			],
			'two strings in list as ZObject, all tails ZObject' => [
				'{ "Z1K1": "Z10", "Z10K1": "a", "Z10K2":' .
				'{ "Z1K1": "Z10", "Z10K1": "b", "Z10K2": { "Z1K1": "Z10" } } }',
				'["a", "b"]'
			],
			'two strings in list as ZObject, tails mixed' => [
				'{ "Z1K1": "Z10", "Z10K1": "a", "Z10K2":' .
				'{ "Z1K1": "Z10", "Z10K1": "b", "Z10K2": [] } }',
				'["a", "b"]'
			],
			'two strings in list as ZObject, no tail in tail' => [
				'{ "Z1K1": "Z10", "Z10K1": "a", "Z10K2":' .
				'{ "Z1K1": "Z10", "Z10K1": "b" } }',
				'["a", "b"]'
			],
			'list in list' => [
				'[[]]',
				'[[]]'
			],
			'lists in list' => [
				'[[], []]',
				'[[], []]'
			],
			'empty ZObject in list' => [
				'[{ "Z1K1": "Z10" }]',
				'[[]]'
			],
			'empty ZObjects in list' => [
				'[{ "Z1K1": "Z10" }, { "Z1K1": "Z10" }]',
				'[[], []]'
			],
			'empty ZObjects in list, all ZObjects' => [
				'{ "Z1K1": "Z10", "Z10K1": { "Z1K1": "Z10" }, "Z10K2":' .
				'{ "Z1K1": "Z10", "Z10K1": { "Z1K1": "Z10" }, "Z10K2":' .
				'{ "Z1K1": "Z10" } } }',
				'[[], []]'
			],
			'ZObject in list' => [
				'{ "Z1K1": "Z10", "Z10K1": { "Z1K1": "Z6", "Z6K1": "Z1" },' .
				'  "Z10K2": { "Z1K1": "Z10" } }',
				'[{ "Z1K1": "Z6", "Z6K1": "Z1" }]'
*/
