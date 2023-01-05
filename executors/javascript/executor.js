'use strict';

// eslint-disable-next-line no-unused-vars
const { serialize, deserialize } = require( './serialization.js' );
// eslint-disable-next-line no-unused-vars
const { ZObject, ZPair } = require( './ztypes.js' );

const { makeMappedResultEnvelope } = require( './function-schemata/javascript/src/utils.js' );

function error( message ) {
	return {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z5' },
		Z5K2: { Z1K1: 'Z6', Z6K1: message }
	};
}

// eslint-disable-next-line no-unused-vars
async function execute( functionCall, stdin = process.stdin, stdout = process.stdout ) {
	const resultCache = new Map();
	const boundValues = new Map();
	const argumentNames = [];
	const functionName = functionCall.functionName;

	// TODO (T282891): Handle input that fails to validate all at once instead of ad hoc.
	if ( functionName === undefined ) {
		return makeMappedResultEnvelope(
			null,
			error( 'Function call did not provide functionName.' )
		);
	}

	// TODO (T289319): Consider whether to reduce all keys to local keys.
	for ( const key of Object.keys( functionCall.functionArguments ) ) {
		argumentNames.push( key );
		boundValues.set( key, functionCall.functionArguments[ key ] );
	}
	argumentNames.sort();

	const implementation = functionCall.codeString;
	if ( implementation === undefined ) {
		return makeMappedResultEnvelope(
			null,
			error( 'Function call did not provide codeString.' )
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
			const functionCall = JSON.parse( chunk );
			if ( functionCall ) {
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
