'use strict';

const { serialize, deserialize } = require( '../serialization.js' );
const { ZPair } = require( '../utils.js' );
const { withoutZ1K1s } = require( './utils.js' );
const assert = require( 'chai' ).assert;

const Z881_Z1_Type_ = {
	Z1K1: { Z1K1: 'Z9', Z9K1: 'Z4' },
	Z4K1: {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z7' },
		Z7K1: { Z1K1: 'Z9', Z9K1: 'Z881' },
		Z881K1: { Z1K1: 'Z9', Z9K1: 'Z1' }
	},
	Z4K2: {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' },
		Z10K1: {
			Z1K1: { Z1K1: 'Z9', Z9K1: 'Z3' },
			Z3K1: { Z1K1: 'Z9', Z9K1: 'Z1' },
			Z3K2: { Z1K1: 'Z6', Z6K1: 'K1' },
			Z3K3: { Z1K1: 'Z12', Z12K1: { Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' } } }
		},
		Z10K2: {
			Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' },
			Z10K1: {
				Z1K1: { Z1K1: 'Z9', Z9K1: 'Z3' },
				Z3K1: {
					Z1K1: { Z1K1: 'Z9', Z9K1: 'Z7' },
					Z7K1: { Z1K1: 'Z9', Z9K1: 'Z881' },
					Z881K1: { Z1K1: 'Z9', Z9K1: 'Z1' }
				},
				Z3K2: { Z1K1: 'Z6', Z6K1: 'K2' },
				Z3K3: {
					Z1K1: 'Z12',
					Z12K1: { Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' } }
				}
			},
			Z10K2: {
				Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' }
			}
		}
	},
	Z4K3: { Z1K1: 'Z9', Z9K1: 'Z104' }
};
const Z882_Type_ = {
	Z1K1: { Z1K1: 'Z9', Z9K1: 'Z4' },
	Z4K1: {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z7' },
		Z7K1: { Z1K1: 'Z9', Z9K1: 'Z882' },
		Z882K1: { Z1K1: 'Z9', Z9K1: 'Z6' },
		Z882K2: { Z1K1: 'Z9', Z9K1: 'Z6' }
	},
	Z4K2: {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' },
		Z10K1: {
			Z1K1: { Z1K1: 'Z9', Z9K1: 'Z3' },
			Z3K1: { Z1K1: 'Z9', Z9K1: 'Z6' },
			Z3K2: { Z1K1: 'Z6', Z6K1: 'K1' },
			Z3K3: { Z1K1: 'Z12', Z12K1: { Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' } } }
		},
		Z10K2: {
			Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' },
			Z10K1: {
				Z1K1: { Z1K1: 'Z9', Z9K1: 'Z3' },
				Z3K1: { Z1K1: 'Z9', Z9K1: 'Z6' },
				Z3K2: { Z1K1: 'Z6', Z6K1: 'K2' },
				Z3K3: {
					Z1K1: 'Z12',
					Z12K1: { Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' } }
				}
			},
			Z10K2: {
				Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' }
			}
		}
	},
	Z4K3: { Z1K1: 'Z9', Z9K1: 'Z104' }
};

const Z6_ = { Z1K1: 'Z6', Z6K1: 'opiparo' };
const Z10_INPUT_ = {
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
const Z10_OUTPUT_ = {
	Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' },
	Z10K1: {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z40' },
		Z40K1: { Z1K1: 'Z9', Z9K1: 'Z41' }
	},
	Z10K2: {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' },
		Z10K1: { Z1K1: 'Z6', Z6K1: 'tRue' },
		Z10K2: {
			Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' },
			Z10K1: {
				Z1K1: Z881_Z1_Type_
			},
			Z10K2: { Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' } }
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
const Z10_DESERIALIZED_ = [ true, 'tRue', [] ];
const Z881_Z6_DESERIALIZED_ = [ 'horses', 'regular ungulates' ];
const Z882_DESERIALIZED_ = new ZPair( 'pigs', 'just pigs' );

const Z1_Type_ = { Z1K1: 'Z9', Z9K1: 'Z1' };
const Z6_Type_ = { Z1K1: 'Z9', Z9K1: 'Z6' };
const Z10_Type_ = { Z1K1: 'Z9', Z9K1: 'Z10' };
const Z21_Type_ = { Z1K1: 'Z9', Z9K1: 'Z21' };
const Z40_Type_ = { Z1K1: 'Z9', Z9K1: 'Z40' };
const Z881_Z6_Type_ = {
	Z1K1: { Z1K1: 'Z9', Z9K1: 'Z4' },
	Z4K1: {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z7' },
		Z7K1: { Z1K1: 'Z9', Z9K1: 'Z881' },
		Z881K1: { Z1K1: 'Z9', Z9K1: 'Z6' }
	},
	Z4K2: {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' },
		Z10K1: {
			Z1K1: { Z1K1: 'Z9', Z9K1: 'Z3' },
			Z3K1: { Z1K1: 'Z9', Z9K1: 'Z6' },
			Z3K2: { Z1K1: 'Z6', Z6K1: 'K1' },
			Z3K3: { Z1K1: 'Z12', Z12K1: { Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' } } }
		},
		Z10K2: {
			Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' },
			Z10K1: {
				Z1K1: { Z1K1: 'Z9', Z9K1: 'Z3' },
				Z3K1: {
					Z1K1: { Z1K1: 'Z9', Z9K1: 'Z7' },
					Z7K1: { Z1K1: 'Z9', Z9K1: 'Z881' },
					Z881K1: { Z1K1: 'Z9', Z9K1: 'Z6' }
				},
				Z3K2: { Z1K1: 'Z6', Z6K1: 'K2' },
				Z3K3: {
					Z1K1: 'Z12',
					Z12K1: { Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' } }
				}
			},
			Z10K2: {
				Z1K1: { Z1K1: 'Z9', Z9K1: 'Z10' }
			}
		}
	},
	Z4K3: { Z1K1: 'Z9', Z9K1: 'Z104' }
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

describe( 'Javascript executor: deserialization', () => { // eslint-disable-line no-undef

	it( 'test deserializes Z6', () => { // eslint-disable-line no-undef
		assert.deepEqual( Z6_DESERIALIZED_, deserialize( Z6_ ) );
	} );

	it( 'test deserializes Z10', () => { // eslint-disable-line no-undef
		assert.deepEqual( Z10_DESERIALIZED_, deserialize( Z10_INPUT_ ) );
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

	it( 'test deserializes Z86', () => { // eslint-disable-line no-undef
		assert.deepEqual( '%', deserialize( Z86_ ) );
	} );

	it( 'test deserializes Z882', () => { // eslint-disable-line no-undef
		const expected = Z882_DESERIALIZED_;
		const actual = deserialize( Z882_ );
		assert.deepEqual( expected.K1, actual.K1 );
		assert.deepEqual( expected.K2, actual.K2 );
	} );
} );

describe( 'Javascript executor: serialization', () => { // eslint-disable-line no-undef

	function runTest( expected, actual ) {
		assert.deepEqual( withoutZ1K1s( expected ), withoutZ1K1s( actual ) );
	}

	it( 'test serializes Z6', () => { // eslint-disable-line no-undef
		runTest( Z6_, serialize( Z6_DESERIALIZED_, Z6_Type_ ) );
	} );

	it( 'test serializes Z10', () => { // eslint-disable-line no-undef
		runTest( Z10_OUTPUT_, serialize( Z10_DESERIALIZED_, Z10_Type_ ) );
	} );

	it( 'test serializes Z21', () => { // eslint-disable-line no-undef
		runTest( Z21_, serialize( null, Z21_Type_ ) );
	} );

	it( 'test serializes Z40: Z41', () => { // eslint-disable-line no-undef
		runTest( ZTrue_, serialize( true, Z40_Type_ ) );
	} );

	it( 'test serializes Z40: Z42', () => { // eslint-disable-line no-undef
		runTest( ZFalse_, serialize( false, Z40_Type_ ) );
	} );

	it( 'test serializes Z882', () => { // eslint-disable-line no-undef
		runTest( Z882_, serialize( Z882_DESERIALIZED_, Z882_Type_ ) );
	} );

	it( 'test serializes Z882 default', () => { // eslint-disable-line no-undef
		runTest( Z882_, serialize( Z882_DESERIALIZED_, Z1_Type_ ) );
	} );

	it( 'test serializes Z881', () => { // eslint-disable-line no-undef
		runTest( Z881_Z6_, serialize( Z881_Z6_DESERIALIZED_, Z881_Z6_Type_ ) );
	} );

	it( 'test serializes Z881 default', () => { // eslint-disable-line no-undef
		runTest( Z881_Z6_, serialize( Z881_Z6_DESERIALIZED_, Z1_Type_ ) );
	} );

	it( 'test serializes Z882', () => { // eslint-disable-line no-undef
		assert.deepEqual( Z882_, serialize( Z882_DESERIALIZED_, Z882_Type_ ) );
	} );

	it( 'test serializes Z882 default', () => { // eslint-disable-line no-undef
		assert.deepEqual( Z882_, serialize( Z882_DESERIALIZED_, Z1_Type_ ) );
	} );

	it( 'test serializes Z881', () => { // eslint-disable-line no-undef
		assert.deepEqual( Z881_Z6_, serialize( Z881_Z6_DESERIALIZED_, Z881_Z6_Type_ ) );
	} );

	it( 'test serializes Z881 default', () => { // eslint-disable-line no-undef
		assert.deepEqual( Z881_Z6_, serialize( Z881_Z6_DESERIALIZED_, Z1_Type_ ) );
	} );
} );
