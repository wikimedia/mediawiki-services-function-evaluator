'use strict';

const { serialize, deserialize } = require( '../serialization.js' );
const { ZObject, ZPair } = require( '../ztypes.js' );
const { withoutZ1K1s } = require( './utils.js' );
const assert = require( 'chai' ).assert;

const Z881_Z1_Type_ = {
	Z1K1: { Z1K1: 'Z9', Z9K1: 'Z7' },
	Z7K1: { Z1K1: 'Z9', Z9K1: 'Z881' },
	Z881K1: { Z1K1: 'Z9', Z9K1: 'Z1' }
};
const Z882_Type_ = {
	Z1K1: { Z1K1: 'Z9', Z9K1: 'Z7' },
	Z7K1: { Z1K1: 'Z9', Z9K1: 'Z882' },
	Z882K1: { Z1K1: 'Z9', Z9K1: 'Z6' },
	Z882K2: { Z1K1: 'Z9', Z9K1: 'Z6' }
};

const Z6_ = { Z1K1: 'Z6', Z6K1: 'opiparo' };
const Z881_Z1_INPUT_ = {
	Z1K1: Z881_Z1_Type_,
	K1: {
		Z1K1: {
			Z1K1: 'Z9',
			Z9K1: 'Z40'
		},
		Z40K1: {
			Z1K1: 'Z9',
			Z9K1: 'Z41'
		}
	},
	K2: {
		Z1K1: Z881_Z1_Type_,
		K1: {
			Z1K1: 'Z6',
			Z6K1: 'tRue'
		},
		K2: {
			Z1K1: Z881_Z1_Type_,
			K1: {
				Z1K1: Z881_Z1_Type_
			},
			K2: {
				Z1K1: Z881_Z1_Type_
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
const Z39_ = {
	Z1K1: {
		Z1K1: 'Z9',
		Z9K1: 'Z39'
	},
	Z39K1: {
		Z1K1: 'Z6',
		Z6K1: 'Z1000K1'
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
const Z86_ = {
	Z1K1: {
		Z1K1: 'Z9',
		Z9K1: 'Z86'
	},
	Z86K1: {
		Z1K1: 'Z6',
		Z6K1: '%'
	}
};
const Z882_ = {
	Z1K1: Z882_Type_,
	K1: { Z1K1: 'Z6', Z6K1: 'pigs' },
	K2: { Z1K1: 'Z6', Z6K1: 'just pigs' }
};

const Z6_DESERIALIZED_ = 'opiparo';
const Z881_Z1_DESERIALIZED_ = [ true, 'tRue', [] ];
const Z881_Z6_DESERIALIZED_ = [ 'horses', 'regular ungulates' ];
const Z882_DESERIALIZED_ = new ZPair( 'pigs', 'just pigs' );

const Z881_Z6_Type_ = {
	Z1K1: { Z1K1: 'Z9', Z9K1: 'Z7' },
	Z7K1: { Z1K1: 'Z9', Z9K1: 'Z881' },
	Z881K1: { Z1K1: 'Z9', Z9K1: 'Z6' }
};
const Z881_Z6_ = {
	Z1K1: Z881_Z6_Type_,
	K1: { Z1K1: 'Z6', Z6K1: 'horses' },
	K2: {
		Z1K1: Z881_Z6_Type_,
		K1: { Z1K1: 'Z6', Z6K1: 'regular ungulates' },
		K2: { Z1K1: Z881_Z6_Type_ }
	}
};

const USER_DEFINED_TYPE_ = {
	Z1K1: {
		Z1K1: 'Z9',
		Z9K1: 'Z4'
	},
	Z4K1: {
		Z1K1: 'Z9',
		Z9K1: 'Z10101'
	},
	Z4K2: {
		Z1K1: {
			Z1K1: { Z1K1: 'Z9', Z9K1: 'Z7' },
			Z7K1: { Z1K1: 'Z9', Z9K1: 'Z881' },
			Z881K1: { Z1K1: 'Z9', Z9K1: 'Z3' }
		},
		K1: {
			Z1K1: {
				Z1K1: 'Z9',
				Z9K1: 'Z3'
			},
			Z3K1: {
				Z1K1: 'Z9',
				Z9K1: 'Z6'
			},
			Z3K2: {
				Z1K1: 'Z6',
				Z6K1: 'Z10101K1'
			},
			Z3K3: {
				Z1K1: 'Z9',
				Z9K1: 'Z333'
			}
		},
		K2: {
			Z1K1: {
				Z1K1: { Z1K1: 'Z9', Z9K1: 'Z7' },
				Z7K1: { Z1K1: 'Z9', Z9K1: 'Z881' },
				Z881K1: { Z1K1: 'Z9', Z9K1: 'Z3' }
			},
			K1: {
				Z1K1: {
					Z1K1: 'Z9',
					Z9K1: 'Z3'
				},
				Z3K1: {
					Z1K1: 'Z9',
					Z9K1: 'Z6'
				},
				Z3K2: {
					Z1K1: 'Z6',
					Z6K1: 'Z10101K2'
				},
				Z3K3: {
					Z1K1: 'Z9',
					Z9K1: 'Z333'
				}
			},
			K2: {
				Z1K1: {
					Z1K1: { Z1K1: 'Z9', Z9K1: 'Z7' },
					Z7K1: { Z1K1: 'Z9', Z9K1: 'Z881' },
					Z881K1: { Z1K1: 'Z9', Z9K1: 'Z3' }
				}
			}
		}
	},
	Z4K3: {
		Z1K1: 'Z9',
		Z9K1: 'Z222'
	}
};
const USER_DEFINED_DESERIALIZED_ = new ZObject(
	new Map( [ [ 'Z10101K1', 'tRue' ], [ 'Z10101K2', 'trUe' ] ] ),
	USER_DEFINED_TYPE_
);
const USER_DEFINED_DESERIALIZED_NO_Z1K1_ = new ZObject(
	new Map( [ [ 'Z10101K1', 'tRue' ], [ 'Z10101K2', 'trUe' ] ] )
);
const USER_DEFINED_ = {
	Z1K1: USER_DEFINED_TYPE_,
	Z10101K1: {
		Z1K1: 'Z6',
		Z6K1: 'tRue'
	},
	Z10101K2: {
		Z1K1: 'Z6',
		Z6K1: 'trUe'
	}
};

describe( 'Javascript executor: deserialization', () => { // eslint-disable-line no-undef

	it( 'test deserializes Z6', () => { // eslint-disable-line no-undef
		assert.deepEqual( Z6_DESERIALIZED_, deserialize( Z6_ ) );
	} );

	it( 'test deserializes list of Z1', () => { // eslint-disable-line no-undef
		assert.deepEqual( Z881_Z1_DESERIALIZED_, deserialize( Z881_Z1_INPUT_ ) );
	} );

	it( 'test deserializes Z21', () => { // eslint-disable-line no-undef
		assert.deepEqual( null, deserialize( Z21_ ) );
	} );

	it( 'test deserializes Z39', () => { // eslint-disable-line no-undef
		assert.deepEqual( 'Z1000K1', deserialize( Z39_ ) );
	} );

	it( 'test deserializes Z40: Z41', () => { // eslint-disable-line no-undef
		assert.deepEqual( true, deserialize( ZTrue_ ) );
	} );

	it( 'test deserializes Z40: Z42', () => { // eslint-disable-line no-undef
		assert.deepEqual( false, deserialize( ZFalse_ ) );
	} );

	it( 'test deserializes Z86', () => { // eslint-disable-line no-undef
		assert.deepEqual( '%', deserialize( Z86_ ) );
	} );

	it( 'test deserializes Z882', () => { // eslint-disable-line no-undef
		const expected = Z882_DESERIALIZED_;
		const actual = deserialize( Z882_ );
		assert.deepEqual( expected.K1, actual.K1 );
		assert.deepEqual( expected.K2, actual.K2 );
	} );

	it( 'test deserializes user-defined', () => { // eslint-disable-line no-undef
		const expected = USER_DEFINED_DESERIALIZED_;
		const actual = deserialize( USER_DEFINED_ );
		assert.deepEqual( expected, actual );
	} );

} );

describe( 'Javascript executor: serialization', () => { // eslint-disable-line no-undef

	function runTest( expected, actual ) {
		assert.deepEqual( withoutZ1K1s( expected ), withoutZ1K1s( actual ) );
	}

	it( 'test serializes Z6', async () => { // eslint-disable-line no-undef
		runTest( Z6_, await serialize( Z6_DESERIALIZED_ ) );
	} );

	it( 'test serializes list of Z1', async () => { // eslint-disable-line no-undef
		runTest( Z881_Z1_INPUT_, await serialize( Z881_Z1_DESERIALIZED_, Z881_Z1_Type_ ) );
	} );

	it( 'test serializes Z21', async () => { // eslint-disable-line no-undef
		runTest( Z21_, await serialize( null ) );
	} );

	it( 'test serializes Z40: Z41', async () => { // eslint-disable-line no-undef
		runTest( ZTrue_, await serialize( true ) );
	} );

	it( 'test serializes Z40: Z42', async () => { // eslint-disable-line no-undef
		runTest( ZFalse_, await serialize( false ) );
	} );

	it( 'test serializes Z882', async () => { // eslint-disable-line no-undef
		runTest( Z882_, await serialize( Z882_DESERIALIZED_ ) );
	} );

	it( 'test serializes Z882 default', async () => { // eslint-disable-line no-undef
		runTest( Z882_, await serialize( Z882_DESERIALIZED_ ) );
	} );

	it( 'test serializes Z881', async () => { // eslint-disable-line no-undef
		runTest( Z881_Z6_, await serialize( Z881_Z6_DESERIALIZED_ ) );
	} );

	it( 'test serializes Z882', async () => { // eslint-disable-line no-undef
		assert.deepEqual( Z882_, await serialize( Z882_DESERIALIZED_ ) );
	} );

	it( 'test serializes Z881', async () => { // eslint-disable-line no-undef
		assert.deepEqual( Z881_Z6_, await serialize( Z881_Z6_DESERIALIZED_ ) );
	} );

	it( 'test serializes user-defined', async () => { // eslint-disable-line no-undef
		const expected = USER_DEFINED_;
		const actual = await serialize( USER_DEFINED_DESERIALIZED_, USER_DEFINED_TYPE_ );
		assert.deepEqual( expected, actual );
	} );

	it( 'test serializes user-defined as Z1 no Z1K1', async () => { // eslint-disable-line no-undef
		const expectedMessage = "Could not serialize input JS object: ZObject { Z1K1: null, Z10101K1: 'tRue', Z10101K2: 'trUe' }";
		let actualError;
		try {
			await serialize( USER_DEFINED_DESERIALIZED_NO_Z1K1_ );
		} catch ( error ) {
			actualError = error;
		}
		assert.deepEqual( expectedMessage, actualError.message );
	} );
} );
