const project = (() => {
  const fs = require("fs");
  const path = require("path");
  try {
    const {
      androidManifestPath,
      iosProjectPath,
      windowsProjectPath,
    } = require("react-native-test-app");
    return {
      android: {
        sourceDir: "android",
        manifestPath: androidManifestPath(path.join(__dirname, "android")),
      },
      ios: {
        project: iosProjectPath("ios"),
      },
      windows: fs.existsSync("windows/Example.sln") && {
        sourceDir: "windows",
        solutionFile: "Example.sln",
        project: windowsProjectPath(path.join(__dirname, "windows")),
      },
    };
  } catch (_) {
    return undefined;
  }
})();

module.exports = {
  ...(project ? { project } : undefined),
};
