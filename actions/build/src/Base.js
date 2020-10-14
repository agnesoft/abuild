import path from "path";

export default class Base {
    constructor(projectRoot = "") {
        this._root = projectRoot == "" ? process.cwd() : projectRoot;
        this._buildScript = path.join(this.root(), "build.sh");
    }

    buildScript() {
        return this._buildScript;
    }

    root() {
        return this._root;
    }
}
