'use strict';

// eslint-disable-next-line no-unused-vars
const { serialize, deserialize } = require( './serialization.js' );
// eslint-disable-next-line no-unused-vars
const { ZObject, ZPair } = require( './utils.js' );

function error( message ) {
	return {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z5' },
		Z5K2: { Z1K1: 'Z6', Z6K1: message }
	};
}

/**
 * Creates a Z23 (Nothing).
 *
 * @return {Object} Z23
 */
function Unit() {
	// TODO(T282891): Use function-schemata version.
	return { Z1K1: 'Z9', Z9K1: 'Z23' };
}

/**
 * Creates a Z22 containing goodResult and BadResult.
 *
 * @param {Object} goodResult Z22K1 of resulting Z22
 * @param {Object} badResult Z22K2 of resulting Z22
 * @return {Object} a Z22
 */
function makePair( goodResult = null, badResult = null ) {
	// TODO(T282891): Use function-schemata version.
	const Z1K1 = {
		Z1K1: 'Z9',
		Z9K1: 'Z22'
	};
	return {
		Z1K1: Z1K1,
		Z22K1: goodResult === null ? Unit() : goodResult,
		Z22K2: badResult === null ? Unit() : badResult
	};
}

function execute( Z7 ) {
	const resultCache = new Map();
	const boundValues = new Map();
	const argumentNames = [];
	let functionName;
	try {
		functionName = Z7.Z7K1.Z8K5.Z9K1;
	} catch ( e ) {
		functionName = undefined;
	}
	// TODO(T282891): Handle input that fails to validate all at once instead of ad hoc.
	if ( functionName === undefined ) {
		return makePair(
			null,
			error( 'Z7K1 did not contain a valid Function.' )
		);
	}

	// TODO(T289319): Consider whether to reduce all keys to local keys.
	for ( const key of Object.keys( Z7 ) ) {
		if ( key.startsWith( functionName ) ) {
			argumentNames.push( key );
			boundValues.set( key, Z7[ key ] );
		}
	}
	argumentNames.sort();

	let implementation;
	try {
		implementation = Z7.Z7K1.Z8K4.Z10K1.Z14K3.Z16K2.Z6K1;
	} catch ( e ) {
		implementation = undefined;
	}
	if ( implementation === undefined ) {
		return makePair(
			null,
			error( 'Z8K4 did not contain a valid Implementation.' )
		);
	}

	const returnValue = functionName + 'K0';
	const returnType = Z7.Z7K1.Z8K2; // eslint-disable-line no-unused-vars
	const functionTemplate = `
        ${implementation}

        let boundLocals = [];
        for ( const key of argumentNames ) {
            const value = boundValues.get(key);
            boundLocals.push(deserialize(value));
        }

        resultCache.set(
            '${returnValue}',
            serialize(${functionName}.apply(null, boundLocals), returnType)
        );
    `;
	try {
		eval( functionTemplate ); // eslint-disable-line no-eval
	} catch ( e ) {
		console.error( e );
		return makePair(
			null,
			error( e.message )
		);
	}

	return makePair(
		resultCache.get( returnValue ),
		null
	);
}

function main( stdin = process.stdin, stdout = process.stdout ) {
	stdin.on( 'readable', () => {
		let chunk;
		while ( ( chunk = stdin.read() ) !== null ) {
			const theInput = JSON.parse( chunk );
			const functionCall = theInput.function_call;
			if ( functionCall !== undefined ) {
				const result = execute( functionCall );
				stdout.write( JSON.stringify( result ) );
			}
		}
	} );
}

if ( module.parent === null ) {
	main();
}

module.exports = { execute, main };
