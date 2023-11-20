import * as esbuild from "esbuild";
import { copyFile, rm, mkdir } from "node:fs/promises";
import clc from "cli-color";

await rm("dist", { recursive: true, force: true });
await mkdir("dist");
await copyFile("public/index.html", "dist/index.html");

const ctx = await esbuild.context({
  entryPoints: ["src/index.jsx"],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ["es2020"],
  outdir: "dist",
});

const { host, port } = await ctx.serve({
  servedir: "dist",
  host: "localhost"
});

console.log(
  clc.whiteBright("Development server running on ") +
  clc.greenBright.underline("http://" + host + ":" + port)
);
