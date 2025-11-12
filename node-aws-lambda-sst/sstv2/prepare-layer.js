/**
 * This script creates a package.json file with the required BAML dependencies,
 * installs them in a layer directory, and creates a zip file for deployment.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const layersDir = path.join(__dirname, "layers");
const layerDir = path.join(layersDir, "baml");
const layerNodeJsDir = path.join(layerDir, "nodejs");
const rootDir = path.join(__dirname);
const packageJsonPath = path.join(rootDir, "package.json");

// Function to read package.json
function readPackageJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

// Function to recursively remove directory
function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        removeDirectory(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

// Clean up existing layer directory
if (fs.existsSync(layerDir)) {
  console.log("Cleaning up existing layer directory...");
  removeDirectory(layerDir);
}

// Read the functions package.json
const packageJson = readPackageJson(packageJsonPath);

// Get the version of @boundaryml/baml
const bamlVersion =
  packageJson.dependencies?.["@boundaryml/baml"] ||
  packageJson.devDependencies?.["@boundaryml/baml"];

if (!bamlVersion) {
  console.log(
    "@boundaryml/baml not found in dependencies. Installing latest version...",
  );
  execSync("pnpm add -D @boundaryml/baml@latest", { stdio: "inherit" });
  packageJson = readPackageJson(packageJsonPath);
  bamlVersion =
    packageJson.dependencies?.["@boundaryml/baml"] ||
    packageJson.devDependencies?.["@boundaryml/baml"];
  if (!bamlVersion) {
    throw new Error("Failed to install @boundaryml/baml");
  }
}

console.log(`Using @boundaryml/baml version: ${bamlVersion}`);

// Create directory structure
fs.mkdirSync(layerNodeJsDir, { recursive: true });

// Create package.json for the layer
const layerPackageJson = {
  name: "baml-layer",
  version: "1.0.0",
  private: true,
  dependencies: {
    "@boundaryml/baml": bamlVersion,
    "@boundaryml/baml-linux-x64-gnu": bamlVersion,
  },
};

// Write the package.json file
fs.writeFileSync(
  path.join(layerNodeJsDir, "package.json"),
  JSON.stringify(layerPackageJson, null, 2),
);

console.log("Created package.json in the layer directory");

// Install dependencies in isolation
console.log("Installing dependencies in the layer directory");
execSync("pnpm install --ignore-workspace", {
  cwd: layerNodeJsDir,
  stdio: "inherit",
});

console.log("Installed dependencies in the layer directory");

// Create zip file, excluding specific paths
const zipFileName = "baml-layer.zip";
execSync(
  `cd ${layerDir} && zip -r ${zipFileName} nodejs -x "nodejs/node_modules/.pnpm/*" "nodejs/node_modules/.bin/*" "nodejs/node_modules/.modules.yaml" "nodejs/pnpm-lock.yaml" "nodejs/package-lock.json" "nodejs/yarn.lock" "nodejs/node_modules/@boundaryml/baml/node_modules/*"`,
  {
    stdio: "inherit",
  }
);

console.log(`Layer prepared successfully in ${layersDir}`);
console.log(`Zip file created: ${layerDir}/${zipFileName}`);
