# High Level Design

- [Problem](#problem)
- [Requirements](#requirements)
- [Existing Solutions](#excisting-solutions)
- [ABuild](#abuild)

## Problem

Building C++ is extremely difficult.

There are only two steps to translating C++ sources into binary - compilation and linking. The compilation step takes a single source file (called [translation unit](https://en.wikipedia.org/wiki/Translation_unit_(programming))) and compiles it into a single binary object file. The collection of these object files is then "linked" together into a final binary - either executable (application), dynamic library (to be loaded during runtime) or a static library (to be linked against during compile time). Compiler toolchains implement exactly this build model. They typically provide the "compiler" and the "linker" among other tools.

The C++ build model has the following main challenges:

1. There is no way for individual translation units to communicate with each other or to share data. To work around this issue a preprocessor is used. During preprocessing of a source file we embed a different shared file (traditionally called "header") into each translation unit that needs the shared data. The header contains shared code (mainly declarations) that introduce symbols that are shared between the translation units (finding these symbols' definition is the job of the linker). There are many issues with this workaround but until C++20 modules there was literally no other way except for directly copying the shared code into each source file.

2. Compilations of every translation unit is completely separate so even though the headers are "shared" they may be percieved differently in different compilations. Using preprocessor again it is possible to enable/disable sections of the code. Produced binary object file might therefore have different notion of the symbols from the header file than others.

3. Different compiler settings can be used to compile each and every translation unit. This means that the produced binary object files can be incompatible with each other on the binary level. These are called [ABI (Application Binary Interface)](https://en.wikipedia.org/wiki/Application_binary_interface) breaks and include for example calling convention, name mangling, exception settings etc. The linker has only very liminted ways to detect these breaks. The only way to guarantee the binary compatibility is to use the very same compiler settings for all translation units that are to be linked together into a final binary.

4. A C++ programmer has to specify the dependency of the translation units twice. First in the code itself either via a header include or a module import and second for the compiler/linker telling it where to find the headers or what modules and libraries to import. Dependency management inside the project and especially when using third party code can become extremely hard.

Authoring calls to the compiler for every source file and then the linker call for every output binary is tedious, error prone and hard to maintain. This issue is further aggravated when using third party dependencies and when targeting multiple compilers and platforms and their combinations. Using a compiler toolchain directly is thus not feasible but for a simplest of projects.

## Requirements

The solution to the difficulty of building C++ using compiler toolchain(s) directly is to have a build system that:

- Provides compiler toolchain settings consistency.
- Provides automatic dependency resolution.
- Allows targeting multiple toolchains and platforms.
- Does not use other language(s) (including its own).
- Is written in C++.
- Can bootstrap itself.
- Supports C++20 modules.

## Existing Solutions



## ABuild


