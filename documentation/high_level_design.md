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

- All of the declarative build systems offer multiple targets and configurations and offer compiler toolchain usage consistency. 
- None of the existing build systems can run without prior configuration of the project in form of project/build files (often using other languages). It is sometimes possible to simplify the project setup to some degree.
- Only some of the build systems provide transparency so that the actual commands run against the compiler toolchain can be inspected.
- None of the existing build systems support automatic dependency resolution (closest comes `boost.build`) - all of them require manual setup of dependencies often in multiple steps: introducing the dependency in the sources, setting up include directories (not always needed) in the build system for a given project and finally adding the dependency to another target.
- None of the existing build systems currently support C++20 modules as an alternative to headers.

## ABuild

The **Agnesoft Build** or **ABuild** is a C++ build system. It provides fully automatic project detection including dependencies based on source inspection. The goal is to be able to run without any configuration of any kind when writing C++ by adhering to a well defined project and file structure instead. By ivoking `abuild` in a project root directory it shall detect all targets, their dependencies and build them using sensible defaults for an available compiler toolchain. If a different behavior than that detectable by the source scanner is required it can be specified as a command line argument (e.g. build in `debug` mode) or via optional configuration file (e.g. for cross compilation or if specific compiler flags are required).

### Build Scanner

The build scanner component is responsible for detecting the available compiler toolchain(s) and to scan the project starting from the current working directory. The environment scanner will attempt to find the compiler toolchain in its typical location given the current host.

The project scanner will detect all translation units inthe current directory and any subdirectories. The translation units will be analyzed for includes and imports. They will then be divided into `projects` that each represent a binary output. For example directories containing `main.c[xx|pp|c]` or a translation unit with a `main` function will become applications, directories with the `[tT]est` at the end will become test applications, other directories will become libraries etc. Commonly used names such as `src` or `include` will be "squashed" into their respective parent projects and linked (if translation units) or bundled (if headers) with it. It is possible to nest projects to compose names with `.` as a separator in the name (e.g. `MyProject/MyApp` -> `MyProject.MyApp`).

### Dependency Resolution

After the analysis the dependency resolution will try to find each of the included file (in case of headers) or exported module (in case of modules) and establish a dependency. On Unix systems that support system wide libraries these can be automatically detected as well. On Windows only limited number of libraries with known install locations (e.g. LLVM) can be automatically detected. For all custom third part dependencies a configuration is required. Result of the depenency resolution is the build graph with all the required for building output as a build cache - a JSON file that also doubles as a compilation database.

Example build cache:
```
{
    "Toolchain: {
        "name": "msvc",
        "compiler: "C:/Program Files/.../cl.exe",
        "cxxflags: [ "/std:c++latest" ]
    },
    "Projects": {
        "MyProject": {
            "MyProject: {
                "paths: [ "src/MyProject", "src/MyProject/include" ]
            }
        }
    },
    "TranslationUnits": {
        "src/MyProject/main.cpp": {
            "dependencies": []
        }
    }
}
```

### Configuration

By default no configuration of any kind is required. The build configuration will be `release` with `optimizations`, `exceptions`, `RTTI` and most `warnings` enabled. These settings are considered standard C++. If you need to change the compilation settings, add dependency resolution or do other changes to the default behavior you need to provide your custom configuration. Some configuration options like building in `debug` mode without `optimizations` and `debugging` enabled are built in and can be specified on the command line. Others like where to find third party dependencies might require configuration file.

The configuration file follows the same structure as tje build cache. It is read by `ABuild` and settings specified in it either augments or overrides the defaults in the build cache.

Example configuration:
```
{
    "Toolchain": {
        "name": "clang"
    }
}
```

#### Usage

The typical usage would be switching to the root directory of the project that is to be built and running `abuild` executable without any parameters. It is also possible to run `abuild` against a single file or subdirectory building only a part of the project (including its dependencies). There is only a single configuration file where all customizations are specified. These can further be overriden from the command line parameters.

Examples:

Default behaviour
```
abuild
```

Overriding configuration on the command line
```
abuild "{ 'Toolchain': { 'name': 'clang' } }"
```
