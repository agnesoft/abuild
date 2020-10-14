import Builder from "../src/Builder.js";
import path from "path";

describe("Builder()", () => {
    test("[default construction]", () => {
        const builder = new Builder();
        expect(builder.root()).toBe(process.cwd());
    });

    test("[custom root]", () => {
        const builder = new Builder("./actions/build");
        expect(builder.root()).toBe("./actions/build");
    });
});

describe("build()", () => {
    test("[success]", async () => {
        const builder = async () => {
            await new Builder(path.join(__dirname, "valid")).build();
        };
        await expect(builder()).resolves.not.toThrow();
    });

    test("[failure]", async () => {
        const builder = async () => {
            await new Builder(path.join(__dirname, "failing")).build();
        };
        await expect(builder()).rejects.toThrow("2");
    });
});
