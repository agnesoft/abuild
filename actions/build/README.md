# build

The `build` action executes a build steps according to the specified build contract (see below).

## Usage

```
- uses: ./actions/build
```

## Build Contract

The build contract described here consists of the _requirements_ and the _build steps_:

### Requirements

The build requirements are prerequisites that the build action expects and validates before it executes any build steps. They are:

-   The build script `build.sh` must be in the project root directory (current directory).
-   LINUX/MAC OS: The build script `build.sh` must have executable permission.
-   WINDOWS: _Git Bash_ is availabe in path `C:/Program Files/Git/bin/bash.exe`

### Build Steps

The build steps are steps executed by the build action if all of the requirements have been successfully validated. They are in order:

-   Run build script `build.sh`.
-   If the build script returns non-zero exit code it is considered a failure and additional steps are executed:
    -   Sets the failure text as the error annotation
    -   Sets the job as failed

## Development

After each modification the action must be compiled and the resulting files `dist/index.js` and `dist/licenses.txt` must be committed:

```
ncc build index.js --license licenses.txt
```

Also to run the action locally you must add:

```
"type": "module"
```

to the package.json but DO NOT COMMIT IT!
