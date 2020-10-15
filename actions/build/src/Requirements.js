import Base from "./Base.js";
import fs from "fs";

export default class Requirements extends Base {
    _buildScriptExists() {
        if (!fs.existsSync(this.buildScript())) {
            throw `Cannot find build script '${this.buildScript()}'`;
        }
    }

    _buildScriptIsExecutable() {
        try {
            fs.accessSync(this.buildScript(), fs.constants.X_OK);
        } catch {
            throw `Build script '${this.buildScript}' is not executable (missing executable permissions).`;
        }
    }

    _buildInterpreterIsAvailable() {
        if (this.buildInterpreter() != "") {
            try {
                fs.accessSync(this.buildInterpreter());
            } catch {
                throw `Build script interpreter '${this.buildInterpreter()}' is not available`;
            }
        }
    }

    validate() {
        this._buildInterpreterIsAvailable();
        this._buildScriptExists();
        this._buildScriptIsExecutable();
    }
}
