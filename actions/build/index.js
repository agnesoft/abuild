import actions from "@actions/core";
import Requirements from "./src/Requirements.js";
import Builder from "./src/Builder.js";

function logSection(section) {
    actions.info(section.toUpperCase());
    actions.info("-".repeat(section.length));
}

function validate() {
    new Requirements().validate();
}

async function build() {
    await new Builder().build();
}

async function main() {
    try {
        logSection("Build");
        validate();
        await build();
        logSection("SUCCESS");
    } catch (error) {
        logSection("Failed");
        actions.error(error);
        actions.setFailed("Build failed");
    }
}

main();
