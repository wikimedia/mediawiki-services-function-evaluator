#!/usr/bin/env node

'use strict';

const canonicalize = require( './canonicalize.js' );
const evaluate = require( './evaluate.js' );
const normalize = require( './normalize.js' );
const wellformed = require( './wellformed.js' );
const parse = require( './parse.js' );
const error = require( './error.js' );
const validate = require( './validate.js' );

// process arguments
let input;
let ok = false;
let normal = false;
let do_eval = true;
let do_wellformed = false;
let do_validate = false;

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
		console.log( '  --help        for showing this help' );
		console.log( '  --normal      for normalizing the result (otherwise canonical)' );
		console.log( '  --noeval      for not evaluating the parse (default is to evaluate)' );
		console.log( '  --wellformed  just check if input is wellformed' );
		console.log( '  --validate    just validate and return the result of validation' );
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

	if ( arg === '--wellformed' ) {
		do_wellformed = true;
		continue;
	}

	if ( arg === '--validate' ) {
		do_validate = true;
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

/* eslint-disable no-process-exit */
if ( !ok ) {
	process.exit();
}

let result = wellformed( parse( input ) );

if ( do_wellformed ) {
	if ( result.Z1K1 !== 'Z5' ) {
		if ( result.Z5K1 !== error.syntax_error && result.Z5K1 !== error.not_wellformed ) {
			console.log( 'OK' );
			process.exit();
		}
	}
}

result = normalize( result );

const validation = validate( result );

if ( validation.length > 0 ) {
	result = validation;
}

if ( do_validate && validation.length === 0 ) {
	console.log( 'OK' );
	process.exit();
}
/* eslint-enable no-process-exit */

if ( do_eval ) {
	result = evaluate( normalize( result ) );
}

if ( normal ) {
	result = normalize( result );
} else {
	result = canonicalize( result );
}

console.log( JSON.stringify( result, null, 2 ) );
