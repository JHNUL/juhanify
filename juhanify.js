#!/usr/bin/env node

import { mkdir, readdir, copyFile, readFile, writeFile } from "node:fs/promises";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const args = process.argv;
let template = "default";
let projectName = "";

for (const arg of args) {
  const pair = arg.split(/=/);
  if (pair.length === 2) {
    const opt = pair[0];
    const value = pair[1];
    if (opt === "--template") {
      template = value;
    }
    if (opt === "--projectName") {
      projectName = value;
    }
  }
}

if (!["default"].includes(template)) {
  console.log(`Template ${template} not supported!`);
  process.exit(1);
}

if (!projectName.match(/[a-zA-Z]{1}[a-zA-Z_\-0-9].*/)) {
  console.log(`Project name ${projectName} can contain only alphanumerics, underscore and hyphen!`);
  process.exit(1);
}

const directories = await readdir(".");

if (directories.includes(projectName)) {
  console.log(`Directory "${projectName}" already exists!`);
  process.exit(1);
}

const sourcePath = join(dirname(fileURLToPath(import.meta.url)), "templates", template);
const pathToProject = resolve(process.cwd(), projectName);

// ----------- Create directories
await mkdir(projectName);
await mkdir(`${projectName}/public`);
await mkdir(`${projectName}/src`);
await mkdir(`${projectName}/tests`);

// ----------- Create public directory content
const html = await readFile(`${sourcePath}/index.html`, "utf-8");
const finalHtml = html.replace("$PROJECT_NAME$", projectName);
await writeFile(`${pathToProject}/public/index.html`, finalHtml);

// ----------- Create src directory content
await copyFile(`${sourcePath}/index.jsx`, `${pathToProject}/src/index.jsx`);
await copyFile(`${sourcePath}/App.jsx`, `${pathToProject}/src/App.jsx`);
await copyFile(`${sourcePath}/index.css`, `${pathToProject}/src/index.css`);

// ----------- Create test directory content
await copyFile(`${sourcePath}/App.test.js`, `${pathToProject}/tests/App.test.js`);

// ----------- Create root content
const packageJson = await readFile(`${sourcePath}/package.json`, "utf-8");
const finalPackageJson = JSON.parse(packageJson);
finalPackageJson.name = projectName;
await writeFile(`${pathToProject}/package.json`, JSON.stringify(finalPackageJson, "", 2));
await writeFile(`${pathToProject}/.gitignore`, "node_modules");
await copyFile(`${sourcePath}/esbuild.config.dev.mjs`, `${pathToProject}/esbuild.config.dev.mjs`);
await copyFile(`${sourcePath}/README.md`, `${pathToProject}/README.md`);
await copyFile(`${sourcePath}/jest.config.js`, `${pathToProject}/jest.config.js`);
await copyFile(`${sourcePath}/jest.setupAfterEnv.js`, `${pathToProject}/jest.setupAfterEnv.js`);
await copyFile(`${sourcePath}/jest.transformer.js`, `${pathToProject}/jest.transformer.js`);
await copyFile(`${sourcePath}/jsconfig.json`, `${pathToProject}/jsconfig.json`);

// ----------- Run commands ----------- //
const doSpawn = async (cmd, args, ctx) => {
  return new Promise((res, rej) => {
    const proc = spawn(cmd, args, { cwd: ctx });
    proc.stdout.on("data", (data) => {
      console.log(`${cmd}: ${data}`);
    });
    proc.stderr.on("data", (data) => {
      console.log(`${cmd} error: ${data}`);
    });
    proc.on("close", (code) => {
      if (code === 0) {
        res(code);
      } else {
        rej(code);
      }
    });
  });
};

// ----------- Git init
await doSpawn("git", ["init"], pathToProject);

const deps = ["react@^18.2.0", "react-dom@^18.2.0"];

const devDeps = [
  "@testing-library/jest-dom@^6.1.1",
  "@testing-library/react@^14.0.0",
  "@types/jest@^29.5.4",
  "cli-color@^2.0.3",
  "esbuild@^0.19.2",
  "jest@^29.6.3",
  "jest-environment-jsdom@^29.6.3",
  "normalize.css@^8.0.1",
];

// ----------- Npm install
await doSpawn("npm", ["install", ...deps], pathToProject);
await doSpawn("npm", ["install", "--save-dev", ...devDeps], pathToProject);
