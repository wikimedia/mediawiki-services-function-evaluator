'use strict';

const { isString } = require( '../utils.js' );

function withoutZ1K1s( ZObject ) {
	const newObject = {};
	for ( const key of Object.keys( ZObject ) ) {
		if ( key === 'Z1K1' ) {
			continue;
		}
		let value = ZObject[ key ];
		if ( !isString( value ) ) {
			value = withoutZ1K1s( value );
		}
		newObject[ key ] = value;
	}
	return newObject;
}

module.exports = { withoutZ1K1s };
