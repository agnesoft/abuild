import Builder from "../src/Builder.js";

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
