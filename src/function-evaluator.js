#!/usr/bin/env node

'use strict';

const canonicalize = require( './canonicalize.js' );
const evaluate = require( './evaluate.js' );
const normalize = require( './normalize.js' );
const wellformed = require( './wellformed.js' );
const parse = require( './parse.js' );

// process arguments
let input;
let ok = false;
let normal = false;
let do_eval = true;
if ( process.argv.length < 3 ) {
	console.log( 'function-evaluator v0.0.1' );
	console.log( 'See --help for help' );
}
for ( let i = 2; i < process.argv.length; i++ ) {
	const arg = process.argv[ i ];

	if ( arg === '--help' ) {
		console.log( 'Needs a ZObject as an argument, e.g.' );
		console.log( 'function-evaluator.js \'{ "Z1K1": "Z6", "Z6K1": "text" }\'' );
		console.log( 'Available parameters:' );
		console.log( '  --help    for showing this help' );
		console.log( '  --normal  for normalizing the result (otherwise canonical)' );
		console.log( '  --noeval  for not evaluating the parse (default is to evaluate)' );
		continue;
	}

	if ( arg === '--normal' ) {
		normal = true;
		continue;
	}

	if ( arg === '--noeval' ) {
		do_eval = false;
		continue;
	}

	if ( input === undefined ) {
		input = arg;
		ok = true;
		continue;
	}

	console.log( 'Unknown parameter: ' + arg );
	input = '';
	ok = false;
}

if ( ok ) {
	let result = normalize( wellformed( parse( input ) ) );

	if ( do_eval ) {
		result = canonicalize( evaluate( result ) );
	}

	if ( normal ) {
		result = normalize( result );
	}

	console.log( JSON.stringify( result, null, 2 ) );
}
