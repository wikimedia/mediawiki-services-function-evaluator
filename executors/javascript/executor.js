'use strict';

// eslint-disable-next-line no-unused-vars
const { serialize, deserialize } = require( './serialization.js' );
// eslint-disable-next-line no-unused-vars
const { ZObject, ZPair } = require( './utils.js' );
// eslint-disable-next-line node/no-missing-require
const { convertZListToArray, makeResultEnvelopeWithVoid } = require( './function-schemata/javascript/src/utils.js' );

function error( message ) {
	return {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z5' },
		Z5K2: { Z1K1: 'Z6', Z6K1: message }
	};
}

async function execute( Z7 ) {
	const resultCache = new Map();
	const boundValues = new Map();
	const argumentNames = [];
	let functionName;
	try {
		functionName = Z7.Z7K1.Z8K5.Z9K1;
	} catch ( e ) {
		functionName = undefined;
	}
	// TODO (T282891): Handle input that fails to validate all at once instead of ad hoc.
	if ( functionName === undefined ) {
		return makeResultEnvelopeWithVoid(
			null,
			error( 'Z7K1 did not contain a valid Function.' )
		);
	}

	// TODO (T289319): Consider whether to reduce all keys to local keys.
	for ( const key of Object.keys( Z7 ) ) {
		if ( key.startsWith( functionName ) ) {
			argumentNames.push( key );
			boundValues.set( key, Z7[ key ] );
		}
	}
	argumentNames.sort();

	let implementation;
	try {
		const implementations = convertZListToArray( Z7.Z7K1.Z8K4 );
		implementation = implementations[ 0 ].Z14K3.Z16K2.Z6K1;
	} catch ( e ) {
		implementation = undefined;
	}
	if ( implementation === undefined ) {
		return makeResultEnvelopeWithVoid(
			null,
			error( 'Z8K4 did not contain a valid Implementation.' )
		);
	}

	const returnValue = functionName + 'K0';
	const returnType = Z7.Z7K1.Z8K2; // eslint-disable-line no-unused-vars
	// Why can't this just be defined directly in the eval statement?
	let callMe = null; // eslint-disable-line prefer-const
	const functionTemplate = `
        callMe = async function () {
            ${implementation}

            let boundLocals = [];
            for ( const key of argumentNames ) {
                const value = boundValues.get(key);
                boundLocals.push(deserialize(value));
            }

            resultCache.set(
                '${returnValue}',
                await serialize(${functionName}.apply(null, boundLocals), returnType)
            );
        }
    `;
	try {
		eval( functionTemplate ); // eslint-disable-line no-eval
		await callMe();
	} catch ( e ) {
		console.error( e );
		return makeResultEnvelopeWithVoid(
			null,
			error( e.message )
		);
	}

	return makeResultEnvelopeWithVoid(
		resultCache.get( returnValue ),
		null
	);
}

function main( stdin = process.stdin, stdout = process.stdout ) {
	stdin.on( 'readable', async () => {
		let chunk;
		while ( ( chunk = stdin.read() ) !== null ) {
			const theInput = JSON.parse( chunk );
			const functionCall = theInput.function_call;
			if ( functionCall !== undefined ) {
				const result = await execute( functionCall );
				stdout.write( JSON.stringify( result ) );
			}
		}
	} );
}

if ( module.parent === null ) {
	main();
}

module.exports = { execute, main };
