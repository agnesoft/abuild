import Base from "./Base.js";
import fs from "fs";

export default class Requirements extends Base {
    _validateBuildScriptExists() {
        if (!fs.existsSync(this.buildScript())) {
            throw `Cannot find build script '${this.buildScript()}'`;
        }
    }

    _validateBuildScriptIsExecutable() {
        if (!fs.accessSync(this.buildScript(), fs.constants.X_OK)) {
            throw `Build script '${this.buildScript}' is not executable (missing executable permissions).`;
        }
    }

    validate() {
        this._validateBuildScriptExists();
        this._validateBuildScriptIsExecutable();
    }
}
