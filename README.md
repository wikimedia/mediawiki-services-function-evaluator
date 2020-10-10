This is a simple evaluation engine for ZObjects.

For parameters, run 
```
node src/function-evaluator.js --help
```

Run as:
```
node src/function-evaluator.js '"Test"'

node src/function-evaluator.js '{ "Z1K1": "Z7", "Z7K1": "Z31", "K1": ["a"] }'
```

## Todos
We should probaby change wellformedness to ensure that every Z9 and Z6 have exactly
the same structure, and that if they don't, say if they have extra keys or missing
keys, the wellformedness fails. Checking for Z9 and Z6 correctness is such a big
hassle downstream, and that's something we can do right in the beginning.

The two other magic types are Z7 and Z5.

Z5 should bubble through as much and as fast as possible, unless explicitly handled.
No builtin is allowed to handle a Z5.

A Z7 will fail in evaluation if they are not well set up.

Evaluation is currently a big mess and needs to be fixed up entirely.

src/error.js contains a list of the current errors, needs to be turned into ZObjects.

### Write
- [x] parse
- [x] wellformedness
- [x] normalize
- [x] canonicalize
- [ ] evaluate
- [ ] built-ins
- [ ] labelize
- [ ] validate

### Further todos
- [x] do the tests look right?
- [x] what should be the config for the linter?
- [ ] fix representation and ZIDs of errors
- [x] read arguments
- [ ] settings
- [ ] hook it up to the wiki
- [ ] make it runnable as a service
- [ ] caching
- [ ] use a caching service
- [ ] make it runnable as a CLI
