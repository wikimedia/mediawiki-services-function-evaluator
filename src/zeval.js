#!/usr/bin/env node

'use strict';

console.log('zeval v0.0.1');
console.log(process.argv);

const wellformed = require('./wellformed.js');
const parse = require('./parse.js');

console.log(wellformed(parse(process.argv[2])));
