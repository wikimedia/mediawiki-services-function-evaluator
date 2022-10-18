'use strict';

class ZPair {
	constructor( K1, K2, originalZ1K1 = null ) {
		if ( originalZ1K1 === null ) {
			const { serialize } = require( './serialization.js' );
			const { soupUpZ1K1 } = require( './utils.js' );
			originalZ1K1 = {
				Z1K1: soupUpZ1K1( 'Z7' ),
				Z7K1: soupUpZ1K1( 'Z882' ),
				Z882K1: soupUpZ1K1( serialize( K1 ).Z1K1 ),
				Z882K2: soupUpZ1K1( serialize( K2 ).Z1K1 )
			};
		}
		// FIXME: Remove Z1K1_
		// this.Z1K1_ = originalZ1K1;
		this.Z1K1 = originalZ1K1;
		this.K1 = K1;
		this.K2 = K2;
	}
}

class ZObject {
	constructor( kwargs, originalZ1K1 = null ) {
		this.Z1K1 = originalZ1K1;
		for ( const entry of kwargs.entries() ) {
			this[ entry[ 0 ] ] = entry[ 1 ];
		}
	}
}

module.exports = {
	ZObject,
	ZPair
};
