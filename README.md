This is a simple evaluation engine for ZObjects.

Run as:

```
node src/function-evaluator.js '"Test"'
```

## TODO
Add this line as a test run

```
node src/function-evaluator.js '{ "Z1K1": "Z7", "Z7K1": "Zxx", "ZxxK1": "A" }'
```

### Write
- [x] parse
- [x] wellformedness
- [x] normalize
- [ ] canonicalize
- [ ] evaluate
- [ ] built-ins
- [ ] labelize
- [ ] validate

### Further todos
- [x] do the tests look right?
- [x] what should be the config for the linter?
- [ ] fix representation and ZIDs of errors
- [ ] settings
- [ ] hook it up to the wiki
- [ ] make it runnable as a service
- [ ] caching
- [ ] use a caching service
- [ ] make it runnable as a CLI
