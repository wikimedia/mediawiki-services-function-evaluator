#!/usr/bin/env node

'use strict';

console.log( 'zeval v0.0.1' );

const wellformed = require( './wellformed.js' );
const parse = require( './parse.js' );
const evaluate = require( './evaluate.js' );
const normalize = require( './normalize.js' );

console.log(
	JSON.stringify(
		evaluate(
			normalize(
				wellformed(
					parse( process.argv[ 2 ] )
				)
			)
		), null, 2
	)
);
