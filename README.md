<a href='introduction'></a>
# Wikifunctions function-evaluator

The evaluator service executes user-written 'native' code in a variety of programming languages.
The repository consists of the [evaluator service](#evaluator-service) and a
variety of language-specific [executors](#executors).

## Local installation
You should use one of the [Docker images](https://docker-registry.wikimedia.org/wikimedia/mediawiki-services-function-evaluator)
for local use, and you do not need to download the raw code unless you want to
modify the evalautor. If you're going to attempt that, remember to clone the
repository with the `--recurse-submodules` flag:

```
git clone --recurse-submodules ssh://gerrit.wikimedia.org:29418/mediawiki/services/function-evaluator
```

If you've already cloned the repository but forgot that flag, you can adjust
your local check-out with:

```
git submodule update --init
```

<a href='evaluator-service'></a>
## Evaluator Service
The evaluator itself is a thin wrapper (based on [service-template-node](https://www.mediawiki.org/wiki/ServiceTemplateNode))
responsible for validating incoming objects as Z7/Function calls, determining the correct
[executor](#executors) to delegate to, and returning either the result of
function execution or an appropriate error back to the caller.

<a href='executors'></a>
## Executors
An executor accepts as input a fully dereferenced Z7/Function call (with a single native-code implementation),
executes the native code with the provided inputs, and returns a Z22/Pair containing
in key Z22K1 either the result of successful execution or Z23/Nothing, and in Z22K2 any appropriate Z5/Errors.

### Communication between the Evaluator and Executor
As currently implemented, executors run as child processes of the main Node
process. The evaluator initializes a child process corresponding to the correct
programming language and runs the appropriate executor module. For example,
in order to execute Python code, the evaluator spawns a subprocess with the
command `python3 executors/python3/executor.py`.

Thereafter, the evaluator communicates with the executor via I/O streams:
`stdin`, `stdout`, and `stderr`. The evaluator writes the (JSON-stringified)
Z7/Function call to the child process's `stdin`. The evaluator then waits until the
subprocess terminates. Logs written to `stderr` in the executor will likewise
be logged by the evaluator. The executor writes the (JSON-stringified) Z22/Pair
to `stdout`, which the evaluator collects and returns as JSON.

### Implementing a New Executor
An executor must be able to do three things: 1) communicate with the main
process via standard I/O streams; 2) deserialize ZObjects as appropriate native
types (and perform the inverse serialization operation); and 3) execute code
(via constructions like, e.g., `exec` or `eval`).
The existing Python and JavaScript implementations can hopefully serve as a
reference for how to accomplish these tasks, but serialization and deserialization
deserve particular attention.

For certain built-in types, there is a natural mapping between ZType and
primitive (or standard library) types; currently, executors can (de)serialize
the following types:

- Z6/String    <-> string
- Z10/List     <-> generic sequential container type (list, array, vector, etc.)
- Z21/Unit     <-> nullary type (None, null, etc.)
- Z40/Boolean  <-> Boolean

Any new executor must be able to support these. We expect the list of built-in
types to grow (a little, and finitely); we also expect to be able to support
(de)serialization of user-defined types, but executors can't handle this at
present.

Once we adopt the generic function model, the return type of a Z7/Function call will be fully
specifiable (even if complex, e.g. a Z10/List of Z6/Strings); however, at the moment, it is not.
Therefore, while type inference for deserialization is completely deterministic,
serialization must rely on some type-inferring heuristic.

To be precise: deserialization can trivially determine the type of a Z1/ZObject by
consulting its `Z1K1` attribute, which reports the ZID corresponding to its type.
However, serialization must rely on the language's introspection capabilities
or some other strategy to determine type.

<a href='repository-stewardship'></a>
## Formatting Python Source Code

- ### Create a Python Virtual Environment
```
VENVNAME=venv
python3.6 -m venv ${VENVNAME}
# Any Python version >= 3.6 will work; 3.6 is chosen here to keep pace with the
# base Docker image in .pipeline/blubber.yaml#build-format-python3
. ./${VENVNAME}/bin/activate
pip install -r executors/python3/requirements-format.txt
```

- ### Run Black
```
python -m black executors/python3
```
