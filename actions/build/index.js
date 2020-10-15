import * as actions from "@actions/core";
import Requirements from "./src/Requirements.js";
import Builder from "./src/Builder.js";

function logBanner(message) {
    actions.info("");
    actions.info("*".repeat(message.length + 4));
    actions.info(`* ${message.toUpperCase()} *`);
    actions.info("*".repeat(message.length + 4));
}

function done() {
    logBanner("done");
}

function failed(error) {
    logBanner("failed");
    actions.setFailed(error);
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
        done();
    } catch (error) {
        failed(error);
    }
}

main();
