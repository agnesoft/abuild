# build

The `build` action executes a build steps according to the specified build contract (see below).

## Usage

```
- uses: ./actions/build
```

## Build Contract

The build contract described here consists of the _requirements_ and the _build steps_:

### Requirements

The build requirments are prerequisites that the build action expects and validates before it executes any build steps. They are:

-   The build script `build.sh` must be in the project root directory (current directory).
-   The build script `build.sh` must be executable.
-   WINDOWS ONLY: _Git Bash_ is availabe at path `C:/Program Files/Git/bin/bash.exe`

### Build Steps

The build steps are steps executed by the build action if all of the requirements have been met. They are in order:

-   Run build script `build.sh`.
-   If the build script returns non-zero exit code it is considered a failure and additional steps are executed:
    -   Prints the available details about the error (the exception)
    -   Sets the job as failed

## Development

After each modification the action must be compiled and the resulting files `dist/index.js` and `dist/licenses.txt` must be committed:

```
ncc build index.js --license licenses.txt
```
