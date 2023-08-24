import * as esbuild from "esbuild";
import { copyFile, rm, mkdir } from "node:fs/promises";
import clc from "cli-color";

const BUILD_STATS_OUTPUT_LINE_LEN = 30;

await rm("build", { recursive: true, force: true });
await mkdir("build");
await copyFile("public/index.html", "build/index.html");

const buildResult = await esbuild.build({
  entryPoints: ["src/index.jsx"],
  bundle: true,
  minify: true,
  metafile: true,
  target: ["es2020"],
  outdir: "build",
});

const leftPad = (str, len, char) => {
  if (len <= str.length) {
    return str;
  }
  return [...Array(len - str.length).fill(char), ...str].join("");
};

console.log(clc.greenBright("Build completed!"));
console.log(clc.whiteBright.underline("Build results:"));
for (const [name, stats] of Object.entries(buildResult.metafile.outputs || {})) {
  const bytesStr = Math.round(stats.bytes / 1024).toString() + "K";
  console.log(
    `${clc.cyanBright(name)} ${clc.cyanBright(
      leftPad(bytesStr, BUILD_STATS_OUTPUT_LINE_LEN - name.length, ".")
    )}`
  );
}

const errors = buildResult.errors;
const warnings = buildResult.warnings;
if (errors.length) {
  console.log(clc.redBright(errors));
}
if (warnings.length) {
  console.log(clc.yellowBright(warnings));
}
