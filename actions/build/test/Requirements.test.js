import Requirements from "../src/Requirements.js";
import path from "path";

describe("Requirements()", () => {
    test("[default construction]", () => {
        const requirements = new Requirements();
        expect(requirements.root()).toBe(process.cwd());
    });

    test("[custom root]", () => {
        const requirements = new Requirements("./actions/build");
        expect(requirements.root()).toBe("./actions/build");
    });
});

describe("validate()", () => {
    test("[missing build script]", () => {
        const validator = () => {
            new Requirements().validate();
        };
        expect(validator).toThrow(
            `Cannot find build script '${path.join(
                process.cwd(),
                "/build.sh"
            )}'`
        );
    });

    test("[existing, not executable]", () => {
        const validator = () => {
            new Requirements(path.join(__dirname, "non_executable")).validate();
        };
        expect(validator).not.toThrow(
            `Build script '${path.join(
                __dirname,
                "non_executable",
                "build.sh"
            )}' is not executable (missing executable permissions).`
        );
    });

    test("[valid]", () => {
        const validator = () => {
            new Requirements(path.join(__dirname, "valid")).validate();
        };
        expect(validator).not.toThrow();
    });
});
