/**
 * This script force installs the linux version of the baml binary (in case the script is not running in a linux env we still download that linux binary), copies the deps into a layer, directory and then removes the dependency.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const layersDir = path.join(__dirname, "layers");
const layerDir = path.join(layersDir, "baml-layer");
const layerNodeModulesDir = path.join(layerDir, "nodejs", "node_modules");
const functionsDir = path.join(__dirname, "packages", "functions");
const functionsPackageJsonPath = path.join(functionsDir, "package.json");

function cleanup() {
  console.log("Cleaning up...");
  try {
    execSync("npm uninstall @boundaryml/baml-linux-x64-gnu", {
      cwd: functionsDir,
      stdio: "inherit",
    });
    console.log(
      "Removed @boundaryml/baml-linux-x64-gnu from package.json and node_modules"
    );
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

// Set up cleanup on process exit
process.on("exit", cleanup);
process.on("SIGINT", () => {
  console.log("Caught interrupt signal");
  cleanup();
  process.exit();
});

// Function to read package.json
function readPackageJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

// Read the functions package.json
let packageJson = readPackageJson(functionsPackageJsonPath);

// Get the version of @boundaryml/baml
const bamlVersion = packageJson.dependencies["@boundaryml/baml"];

// Install @boundaryml/baml-linux-x64-gnu with the same version
console.log("Installing @boundaryml/baml-linux-x64-gnu");
execSync(`npm install @boundaryml/baml-linux-x64-gnu@${bamlVersion} --force`, {
  cwd: functionsDir,
  stdio: "inherit",
});

console.log("Ran npm install for @boundaryml/baml-linux-x64-gnu");

// Create directory structure
fs.mkdirSync(layerNodeModulesDir, { recursive: true });

// Function to copy a package
function copyPackage(packageName) {
  const srcDir = path.join(
    __dirname,
    "node_modules",
    "@boundaryml",
    packageName
  );
  const destDir = path.join(layerNodeModulesDir, "@boundaryml", packageName);
  fs.cpSync(srcDir, destDir, { recursive: true });
  console.log(`Copied ${packageName} to layer`);
}

// Copy the dependencies
copyPackage("baml-linux-x64-gnu");
copyPackage("baml");

// Create zip file
const zipFileName = "baml-layer.zip";
execSync(`cd ${layerDir} && zip -r ${path.join("..", zipFileName)} .`);

console.log(`Layer prepared successfully in ${layersDir}`);
console.log(`Zip file created: ${path.join(layersDir, zipFileName)}`);

// Uninstall @boundaryml/baml-linux-x64-gnu
console.log("Uninstalling @boundaryml/baml-linux-x64-gnu");
execSync("npm uninstall @boundaryml/baml-linux-x64-gnu", {
  cwd: functionsDir,
  stdio: "inherit",
});

console.log(
  "Removed @boundaryml/baml-linux-x64-gnu from package.json and node_modules"
);
