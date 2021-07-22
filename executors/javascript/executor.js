'use strict';

// eslint-disable-next-line no-unused-vars
const { serialize, deserialize } = require( './serialization.js' );

function error( message ) {
	return {
		Z1K1: { Z1K1: 'Z9', Z9K1: 'Z5' },
		Z5K2: { Z1K1: 'Z6', Z6K1: message }
	};
}

function writeZObject( ZObject, stream ) {
	stream.write( JSON.stringify( ZObject ) );
}

function execute( Z7, stdout = process.stdout, stderr = process.stderr ) {
	const resultCache = new Map();
	const boundValues = new Map();
	const argumentNames = [];
	let functionName;
	try {
		functionName = Z7.Z7K1.Z8K5.Z9K1;
	} catch ( e ) {
		functionName = undefined;
	}
	// TODO: Handle input that fails to validate all at once instead of ad hoc.
	if ( functionName === undefined ) {
		writeZObject( error( 'Z7K1 did not contain a valid Function.' ), stderr );
		return;
	}

	// TODO: Ensure that these match declared arguments? (already done in orchestrator)
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
		writeZObject( error( 'Z8K4 did not contain a valid Implementation.' ), stderr );
		return;
	}

	const returnValue = functionName + 'K0';
	const functionTemplate = `
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
    `;
	try {
		eval( functionTemplate ); // eslint-disable-line no-eval
	} catch ( e ) {
		writeZObject( error( e.message ), stderr );
		return;
	}

	writeZObject( resultCache.get( returnValue ), stdout );
}

function main( stdin = process.stdin, stdout = process.stdout, stderr = process.stderr ) {
	stdin.on( 'readable', () => {
		let chunk;
		while ( ( chunk = stdin.read() ) !== null ) {
			const theInput = JSON.parse( chunk );
			const functionCall = theInput.function_call;
			if ( functionCall !== undefined ) {
				execute( functionCall, stdout, stderr );
			}
		}
	} );
}

if ( module.parent === null ) {
	main();
}

module.exports = { execute, main };
