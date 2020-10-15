import * as exec from "@actions/exec";

import Base from "./Base.js";

export default class Builder extends Base {
    async build() {
        const buildCommand = this.buildInterpreter()
            ? `"${this.buildInterpreter()}" "${this.buildScript()}"`
            : `"${this.buildScript()}"`;
        await exec.exec(buildCommand);
    }
}
