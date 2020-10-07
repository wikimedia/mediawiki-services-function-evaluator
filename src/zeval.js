#!/usr/bin/env node

'use strict';

console.log('zeval v0.0.1');
console.log(process.argv);

const wellformed = require('./wellformed.js');

console.log(wellformed(process.argv[2]));
