const path = require("path");

/**
 * Joins all specified lines into a single string.
 * @param {...string} lines
 * @returns {string}
 */
function join(...lines) {
  return lines.join("\n");
}

/**
 * Converts an object or value to a pretty JSON string.
 * @param {Record<string, unknown>} obj
 * @return {string}
 */
function serialize(obj) {
  return JSON.stringify(obj, undefined, 2) + "\n";
}

/**
 * @param {string} name
 * @returns {string}
 */
function appManifest(name) {
  return serialize({
    name,
    displayName: name,
    components: [
      {
        appKey: name,
        displayName: name,
      },
    ],
    resources: {
      android: ["dist/res", "dist/main.android.jsbundle"],
      ios: ["dist/assets", "dist/main.ios.jsbundle"],
      macos: ["dist/assets", "dist/main.macos.jsbundle"],
      windows: ["dist/assets", "dist/main.windows.bundle"],
    },
  });
}

/**
 * @param {string} testAppRelPath Relative path to `react-native-test-app`
 * @returns {string}
 */
function buildGradle(testAppRelPath) {
  const rnPath = path.posix.join(path.dirname(testAppRelPath), "react-native");
  return join(
    "buildscript {",
    `    def androidTestAppDir = "${testAppRelPath}/android"`,
    '    apply(from: "${androidTestAppDir}/dependencies.gradle")',
    "",
    "    repositories {",
    "        mavenCentral()",
    "        google()",
    "    }",
    "",
    "    dependencies {",
    "        getReactNativeDependencies().each { dependency ->",
    "            classpath(dependency)",
    "        }",
    "    }",
    "}",
    "",
    "allprojects {",
    "    repositories {",
    "        maven {",
    "            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm",
    `            url("\${rootDir}/${rnPath}/android")`,
    "        }",
    "        mavenCentral()",
    "        google()",
    "    }",
    "}",
    ""
  );
}

/**
 * @param {string} name Root project name
 * @param {string} testAppRelPath Relative path to `react-native-test-app`
 * @returns {string}
 */
function podfileIOS(name, testAppRelPath) {
  return join(
    `require_relative '${testAppRelPath}/test_app'`,
    "",
    "use_flipper! false unless ENV['USE_FLIPPER'] == '1'",
    "",
    `workspace '${name}.xcworkspace'`,
    "",
    `use_test_app!`,
    ""
  );
}

/**
 * @param {string} name Root project name
 * @param {string} testAppRelPath Relative path to `react-native-test-app`
 * @returns {string}
 */
function podfileMacOS(name, testAppRelPath) {
  return join(
    `require_relative '${testAppRelPath}/macos/test_app'`,
    "",
    `workspace '${name}.xcworkspace'`,
    "",
    `use_test_app!`,
    ""
  );
}

/**
 * @returns {string}
 */
function reactNativeConfigAndroidFlat() {
  return join(
    "const project = (() => {",
    "  try {",
    '    const { configureProjects } = require("react-native-test-app");',
    "    return configureProjects({",
    "      android: {",
    '        sourceDir: ".",',
    "      },",
    "    });",
    "  } catch (_) {",
    "    return undefined;",
    "  }",
    "})();",
    "",
    "module.exports = {",
    "  ...(project ? { project } : undefined),",
    "};",
    ""
  );
}

/**
 * @returns {string}
 */
function reactNativeConfigAppleFlat() {
  return join(
    "const project = (() => {",
    "  try {",
    '    const { configureProjects } = require("react-native-test-app");',
    "    return configureProjects({",
    "      ios: {",
    '        sourceDir: ".",',
    "      },",
    "    });",
    "  } catch (_) {",
    "    return undefined;",
    "  }",
    "})();",
    "",
    "module.exports = {",
    "  ...(project ? { project } : undefined),",
    "};",
    ""
  );
}

/**
 * @param {string} name Solution file name (without extension)
 * @returns {string}
 */
function reactNativeConfigWindowsFlat(name) {
  return join(
    "const project = (() => {",
    '  const path = require("path");',
    '  const sourceDir = "windows";',
    "  try {",
    '    const { windowsProjectPath } = require("react-native-test-app");',
    "    return {",
    "      windows: {",
    "        sourceDir,",
    `        solutionFile: "${name}.sln",`,
    "        project: windowsProjectPath(path.join(__dirname, sourceDir)),",
    "      },",
    "    };",
    "  } catch (_) {",
    "    return undefined;",
    "  }",
    "})();",
    "",
    "module.exports = {",
    "  ...(project ? { project } : undefined),",
    '  reactNativePath: "node_modules/react-native-windows",',
    "};",
    ""
  );
}

/**
 * @param {string} name Root project name
 * @param {string} testAppRelPath Relative path to `react-native-test-app`
 * @returns {string}
 */
function settingsGradle(name, testAppRelPath) {
  return join(
    "pluginManagement {",
    "    repositories {",
    "        gradlePluginPortal()",
    "        mavenCentral()",
    "        google()",
    "    }",
    "}",
    "",
    `rootProject.name = "${name}"`,
    "",
    `apply(from: "${testAppRelPath}/test-app.gradle")`,
    "applyTestAppSettings(settings)",
    ""
  );
}

exports.appManifest = appManifest;
exports.buildGradle = buildGradle;
exports.join = join;
exports.podfileIOS = podfileIOS;
exports.podfileMacOS = podfileMacOS;
exports.reactNativeConfigAndroidFlat = reactNativeConfigAndroidFlat;
exports.reactNativeConfigAppleFlat = reactNativeConfigAppleFlat;
exports.reactNativeConfigWindowsFlat = reactNativeConfigWindowsFlat;
exports.serialize = serialize;
exports.settingsGradle = settingsGradle;