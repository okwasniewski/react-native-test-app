import { equal } from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { isDestructive as isDestructiveActual } from "../../scripts/configure.mjs";
import { fs, setMockFiles } from "../fs.mock.js";

describe("isDestructive()", () => {
  /**
   * Example output:
   *
   *   % ../scripts/configure.mjs
   *   [!] The following files will be overwritten:
   *            .watchmanconfig
   *            android/build.gradle
   *            android/gradle.properties
   *            android/settings.gradle
   *            babel.config.js
   *            ios/Podfile
   *            macos/Podfile
   *            metro.config.js
   *            react-native.config.js
   *   [!] The following files will be removed:
   *            ios/Podfile.lock
   *            macos/Podfile.lock
   *   [!] Destructive file operations are required.
   *   Re-run with --force if you're fine with this.
   *   %
   */
  const isDestructive: typeof isDestructiveActual = (p, cfg) =>
    isDestructiveActual(p, cfg, fs);

  afterEach(() => setMockFiles());

  it("returns false when there are no files to modify", () => {
    equal(
      isDestructive(".", {
        scripts: {},
        dependencies: {},
        files: {},
        oldFiles: [],
      }),
      false
    );
  });

  it("returns true when there are files to overwrite", (t) => {
    const warnMock = t.mock.method(console, "warn", () => null);

    const config = {
      scripts: {},
      dependencies: {},
      files: {
        "metro.config.js": "module.exports = {};",
      },
      oldFiles: [],
    };

    equal(isDestructive(".", config), false);
    equal(warnMock.mock.calls.length, 0);

    setMockFiles({ "metro.config.js": "" });

    equal(isDestructive(".", config), true);
    equal(warnMock.mock.calls.length, 2);
  });

  it("returns true when there are files to remove", (t) => {
    const warnMock = t.mock.method(console, "warn", () => null);

    const config = {
      scripts: {},
      dependencies: {},
      files: {
        "metro.config.js": "module.exports = {};",
      },
      oldFiles: ["Podfile.lock"],
    };

    equal(isDestructive(".", config), false);
    equal(warnMock.mock.calls.length, 0);

    setMockFiles({ "Podfile.lock": "" });

    equal(isDestructive(".", config), true);
    equal(warnMock.mock.calls.length, 2);
  });

  it("enumerates all files that need to be modified", (t) => {
    const warnMock = t.mock.method(console, "warn", () => null);

    const config = {
      scripts: {},
      dependencies: {},
      files: {
        "babel.config.js": "module.exports = {};",
        "metro.config.js": "module.exports = {};",
        "react-native.config.js": "module.exports = {};",
      },
      oldFiles: ["Podfile.lock"],
    };

    equal(isDestructive(".", config), false);
    equal(warnMock.mock.calls.length, 0);

    setMockFiles({
      "Podfile.lock": "",
      "babel.config.js": "",
      "metro.config.js": "",
    });

    equal(isDestructive(".", config), true);
    equal(warnMock.mock.calls.length, 5);
    // 2 x "The following files..." + number of files
  });
});
