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
