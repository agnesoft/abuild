import path from "path";
import os from "os";

export default class Base {
    constructor(projectRoot = "") {
        this._root = projectRoot == "" ? process.cwd() : projectRoot;
        this._interpreter =
            os.platform == "win32" ? "C:/Program Files/Git/bin/bash.exe" : "";
        this._buildScript = path.join(this.root(), "build.sh");
    }

    buildInterpreter() {
        return this._interpreter;
    }

    buildScript() {
        return this._buildScript;
    }

    root() {
        return this._root;
    }
}
