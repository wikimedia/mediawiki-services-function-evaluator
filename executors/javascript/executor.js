'use strict';

// eslint-disable-next-line no-unused-vars
const { serialize, deserialize } = require( './serialization.js' );
// eslint-disable-next-line no-unused-vars
const { ZObject, ZPair } = require( './ztypes.js' );

const { convertZListToItemArray, makeMappedResultEnvelope } = require( './function-schemata/javascript/src/utils.js' );

function error( message ) {
	return {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z5' },
		Z5K2: { Z1K1: 'Z6', Z6K1: message }
	};
}

// eslint-disable-next-line no-unused-vars
async function execute( Z7, stdin = process.stdin, stdout = process.stdout ) {
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
		return makeMappedResultEnvelope(
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
		const implementations = convertZListToItemArray( Z7.Z7K1.Z8K4 );
		implementation = implementations[ 0 ].Z14K3.Z16K2.Z6K1;
	} catch ( e ) {
		implementation = undefined;
	}
	if ( implementation === undefined ) {
		return makeMappedResultEnvelope(
			null,
			error( 'Z8K4 did not contain a valid Implementation.' )
		);
	}

	const returnValue = functionName + 'K0';
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
                serialize(${functionName}.apply(null, boundLocals))
            );
        }
    `;
	try {
		eval( functionTemplate ); // eslint-disable-line no-eval
		await callMe();
	} catch ( e ) {
		console.error( e );
		return makeMappedResultEnvelope(
			null,
			error( e.message )
		);
	}

	return makeMappedResultEnvelope(
		resultCache.get( returnValue ),
		null
	);
}

function main( stdin = process.stdin, stdout = process.stdout, stderr = process.stderr ) {
	stdin.on( 'readable', async () => {
		let chunk;
		while ( ( chunk = stdin.read() ) !== null ) {
			const theInput = JSON.parse( chunk );
			const functionCall = theInput.function_call;
			if ( functionCall !== undefined ) {
				const result = await execute( functionCall, stdin, stdout );
				stdout.write( JSON.stringify( result ) );
				stdout.write( '\n' );
				break;
			}
		}
		stderr.write( 'end' );
		stderr.write( '\n' );
	} );
}

if ( module.parent === null ) {
	main();
}

module.exports = { execute, main };
