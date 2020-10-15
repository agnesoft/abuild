import * as actions from "@actions/core";
import Requirements from "./src/Requirements.js";
import Builder from "./src/Builder.js";

function logBanner(message) {
    actions.info("");
    actions.info("*".repeat(message.length + 4));
    actions.info(`* ${message.toUpperCase()} *`);
    actions.info("*".repeat(message.length + 4));
}

function succeeded() {
    logBanner("succeeded");
}

function failed() {
    logBanner("failed");
}

function projectRoot() {
    return actions.getInput("path");
}

function validate() {
    new Requirements(projectRoot()).validate();
}

async function build() {
    await new Builder(projectRoot()).build();
}

async function main() {
    try {
        validate();
        await build();
        succeeded();
    } catch (error) {
        failed();
        actions.setFailed(`Build failed: ${error}`);
    }
}

main();
