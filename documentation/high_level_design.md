# High Level Design

- [Problem](#problem)
- [Requirements](#requirements)
- [Existing Solutions](#excisting-solutions)
- [ABuild](#abuild)

## Problem

Building C++ is difficult.

There are only two steps to translating C++ sources into binary - compilation and linking. The compilation step takes a single source file (called [translation unit](https://en.wikipedia.org/wiki/Translation_unit_(programming))) and compiles it into a single binary object file. The collection of these object files is then "linked" together into a final binary - either executable (application), dynamic library (to be loaded during runtime) or a static library (to be linked against during compile time). Compiler toolchains implement exactly this build model.

This C++ build model has the following main challenges:

1. There is no way for individual translation units to communicate with each other or to share data. To work around this issue a preprocessor is used. During preprocessing of a source file we embed a different shared file (traditionally called "header") into each translation unit that needs to share the same data. The headers contain mainly declarations of symbols that are shared and used between the translation units (finding these symbols' definitions is the job of the linker). There are many issues with this workaround but until C++20 modules there was literally no other way.

2. It is possible to enable/disable sections of the code using preprocessor. Compilation of every translation unit is entirely independent so even though the headers are "shared" they may be percieved differently in different translation units. Produced binary object files might therefore have different notion of the symbols from the header file than others even though the code was "the same".

3. Different compiler settings can be used to compile every translation unit. This means that the produced binary object files can be incompatible with each other on the binary level. These are called [ABI (Application Binary Interface)](https://en.wikipedia.org/wiki/Application_binary_interface) breaks and include for example calling conventions, name mangling, exception settings etc. The linker has only very limited ways to detect these incompatibilities and thus might produce crashing binary that is very hard to debug. The only way to guarantee the binary compatibility is to use the very same compiler settings for all translation units that are to be linked together into a final binary.

4. Dependencies are specified multiple times. Once in the code when we include a header or import a module. Then during compilation when we need to supply locations of the headers and imported module interfaces. And finally during linking we need to supply the libraries (or other object files) that contain the symbols used.

 Authoring calls to the compiler for every source file and then the linker call for every output binary is tedious, error prone and hard to maintain. Especially when targeting multiple compilers and platforms and their combinations. Using third party dependencies is also a significant challenge. Using a compiler toolchain directly is thus not feasible but for a simplest of projects.

## Requirements

The solution to the difficulty of building C++ is to have a build system that:

- Provides compiler toolchain settings consistency.
- Provides automatic dependency resolution.
- Allows targeting multiple toolchains and platforms.
- Allows different configurations.
- Is transparent in what and how it does things.
- Configuration free.
- Is written in C++.
- Can bootstrap itself.
- Supports C++20 modules.

## Existing Solutions

There are many C++ build systems. They generally fall into two categories - imperative or declarative. The former expects the user to specify what & how to build. Their complexity is generally the same as that of using the compiler toolchain directly. The examples are [Make](https://en.wikipedia.org/wiki/Make_(software)) (gmake, nmake etc.) or [Ninja](https://en.wikipedia.org/wiki/Ninja_(build_system)). Their primary usage is to be produced by a build generator.

Build generators are special kind of build system that does not orchestrate the compiler toolchain directly but rather produces a build in terms of other actual build systems, often the imperative ones such as Make or Ninja. They abstract away the compiler toolchain complexity by leveraging other build systems for actual building. The drawback is that the complexity is actually higher and the build become rather opaque and might seem arbitrary as there are two extra layers between the programmer and the compiler. The examples of build generators are [CMake](https://en.wikipedia.org/wiki/CMake) or [Meson](https://en.wikipedia.org/wiki/Meson_(software)).

The declarative build systems organize translation units (and headers) into projects that typically correspond to the desired outputs (applications, libraries). The dependencies are then set manually between the individual projects. The build itself is orchestrated using generalized "rules" provided by the build system and applied to the project's source files. Optionally user can customize the rules to various degree. Examples of declarative build systems are [Bazel](https://en.wikipedia.org/wiki/Bazel_(software)), [build2](https://build2.org/) or [boost.build (b2)](https://boostorg.github.io/build/).

## ABuild


