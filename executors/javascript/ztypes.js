'use strict';

class ZPair {
	constructor( K1, K2, originalZ1K1 = null ) {
		this.Z1K1_ = originalZ1K1;
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
