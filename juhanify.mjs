import { mkdir, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import assert from "node:assert";

assert.equal(process.argv.length, 3, "Project name expected");

const projectName = process.argv[2].trim();

assert.match(
  projectName,
  /^[a-zA-Z_\-0-9]{1,50}$/,
  "Project name can only contain alphanumeric characters, hyphen and underscore"
);

const directories = await readdir(".");

if (directories.includes(projectName)) {
  console.log(`Directory "${projectName}" already exists!`);
  process.exit(1);
}

// ----------- Create directories
await mkdir(projectName);
await mkdir(`${projectName}/public`);
await mkdir(`${projectName}/src`);

// ----------- Create public directory content
const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="/App.css" />
    <script defer="defer" src="/App.js"></script>
    <title>Juhanify app</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app</noscript>
    <div id="root"></div>
  </body>
</html>
`;

await writeFile(`${projectName}/public/index.html`, html, "utf8");

// ----------- Create src directory content
const app = `import React from "react";
import { createRoot } from "react-dom/client";

import "./styles.css";

const root = createRoot(document.getElementById("root"));

root.render(<div>Y HALO THAR!</div>);
`;

const stylesheet = `@import "normalize.css";

body {
  color: indigo;
}
`;

await writeFile(`${projectName}/src/App.jsx`, app, "utf8");
await writeFile(`${projectName}/src/styles.css`, stylesheet, "utf8");

// ----------- Create root content
const gitignore = `.yarn/*
.pnp.*
node_modules
`;

const yarnrc = `nodeLinker: node-modules`;

const esbuildDev = `import * as esbuild from "esbuild";
import { copyFile, rm, mkdir } from "node:fs/promises";
import clc from "cli-color";

await rm("dist", { recursive: true, force: true });
await mkdir("dist");
await copyFile("public/index.html", "dist/index.html");

const ctx = await esbuild.context({
  entryPoints: ["src/App.jsx"],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ["es2020"],
  outdir: "dist",
});

const { host, port } = await ctx.serve({
  servedir: "dist",
});

console.log(
  clc.whiteBright("Development server running on ") +
    clc.greenBright.underline("http://" + host + ":" + port)
);
`;

const packageJson = `{
  "name": "${projectName}",
  "scripts": {
    "start": "node esbuild.config.dev.mjs"
  },
  "browserslist": "last 3 versions"
}
`;

const readme = `# React App Created With Juhanify`;

await writeFile(`${projectName}/.gitignore`, gitignore, "utf8");
await writeFile(`${projectName}/.yarnrc.yml`, yarnrc, "utf8");
await writeFile(`${projectName}/esbuild.config.dev.mjs`, esbuildDev, "utf8");
await writeFile(`${projectName}/package.json`, packageJson, "utf8");
await writeFile(`${projectName}/README.md`, readme, "utf8");

// ----------- Run commands ----------- //

const pathToProject = resolve(process.cwd(), projectName);

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

// ----------- Npm install

await doSpawn("npm", ["install", "react", "react-dom"], pathToProject);
await doSpawn(
  "npm",
  ["install", "--save-dev", "esbuild", "cli-color", "normalize.css"],
  pathToProject
);
