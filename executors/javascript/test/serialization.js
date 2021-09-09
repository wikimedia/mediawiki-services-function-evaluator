'use strict';

const { serialize, deserialize } = require( '../serialization.js' );
const assert = require( 'chai' ).assert;

const Z6_ = { Z1K1: 'Z6', Z6K1: 'opiparo' };
const Z10_ = {
	Z1K1: {
		Z1K1: 'Z9',
		Z9K1: 'Z10'
	},
	Z10K1: {
		Z1K1: {
			Z1K1: 'Z9',
			Z9K1: 'Z40'
		},
		Z40K1: {
			Z1K1: 'Z9',
			Z9K1: 'Z41'
		}
	},
	Z10K2: {
		Z1K1: {
			Z1K1: 'Z9',
			Z9K1: 'Z10'
		},
		Z10K1: {
			Z1K1: 'Z6',
			Z6K1: 'tRue'
		},
		Z10K2: {
			Z1K1: {
				Z1K1: 'Z9',
				Z9K1: 'Z10'
			},
			Z10K1: {
				Z1K1: {
					Z1K1: 'Z9',
					Z9K1: 'Z10'
				}
			},
			Z10K2: {
				Z1K1: {
					Z1K1: 'Z9',
					Z9K1: 'Z10'
				}
			}
		}
	}
};
const Z21_ = {
	Z1K1: {
		Z1K1: 'Z9',
		Z9K1: 'Z21'
	}
};
const ZTrue_ = {
	Z1K1: {
		Z1K1: 'Z9',
		Z9K1: 'Z40'
	},
	Z40K1: {
		Z1K1: 'Z9',
		Z9K1: 'Z41'
	}
};
const ZFalse_ = {
	Z1K1: {
		Z1K1: 'Z9',
		Z9K1: 'Z40'
	},
	Z40K1: {
		Z1K1: 'Z9',
		Z9K1: 'Z42'
	}
};

const Z6_DESERIALIZED_ = 'opiparo';
const Z10_DESERIALIZED_ = [ true, 'tRue', [] ];

describe( 'Javascript executor: deserialization', () => { // eslint-disable-line no-undef

	it( 'test deserializes Z6', () => { // eslint-disable-line no-undef
		assert.deepEqual( Z6_DESERIALIZED_, deserialize( Z6_ ) );
	} );

	it( 'test deserializes Z10', () => { // eslint-disable-line no-undef
		assert.deepEqual( Z10_DESERIALIZED_, deserialize( Z10_ ) );
	} );

	it( 'test deserializes Z21', () => { // eslint-disable-line no-undef
		assert.deepEqual( null, deserialize( Z21_ ) );
	} );

	it( 'test deserializes Z40: Z41', () => { // eslint-disable-line no-undef
		assert.deepEqual( true, deserialize( ZTrue_ ) );
	} );

	it( 'test deserializes Z40: Z42', () => { // eslint-disable-line no-undef
		assert.deepEqual( false, deserialize( ZFalse_ ) );
	} );
} );

describe( 'Javascript executor: serialization', () => { // eslint-disable-line no-undef

	it( 'test serializes Z6', () => { // eslint-disable-line no-undef
		assert.deepEqual( Z6_, serialize( Z6_DESERIALIZED_ ) );
	} );

	it( 'test serializes Z10', () => { // eslint-disable-line no-undef
		assert.deepEqual( Z10_, serialize( Z10_DESERIALIZED_ ) );
	} );

	it( 'test serializes Z21', () => { // eslint-disable-line no-undef
		assert.deepEqual( Z21_, serialize( null ) );
	} );

	it( 'test serializes Z40: Z41', () => { // eslint-disable-line no-undef
		assert.deepEqual( ZTrue_, serialize( true ) );
	} );

	it( 'test serializes Z40: Z42', () => { // eslint-disable-line no-undef
		assert.deepEqual( ZFalse_, serialize( false ) );
	} );
} );
