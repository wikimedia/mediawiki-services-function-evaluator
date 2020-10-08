#!/usr/bin/env node

'use strict';

console.log( 'zeval v0.0.1' );

const wellformed = require( './wellformed.js' );
const parse = require( './parse.js' );

console.log( JSON.stringify( wellformed( parse( process.argv[ 2 ] ) ), null, 2 ) );
