This is a simple evaluation engine for ZObjects.

Run as:

```
node src/zeval.js '"Test"'
```

## TODO
Add this line as a test run

```
node src/zeval.js '{ "Z1K1": "Z7", "Z7K1": "Zxx", "ZxxK1": "A" }'
```

### Write
- [x] parse
- [x] wellformedness
- [ ] normalize
- [ ] labelize
- [ ] canonicalize
- [ ] evaluate
- [ ] built-ins
- [ ] validate

### Further todos
- [ ] do the tests look right?
- [ ] what should be the config for the linter?
- [ ] settings
- [ ] hook it up to the wiki
- [ ] make it runnable as a service
- [ ] caching
- [ ] use a caching service
- [ ] make it runnable as a CLI
