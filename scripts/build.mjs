import { mkdir, copyFile } from "node:fs/promises";
import esbuild from "esbuild";

await mkdir("public/dist", { recursive: true });

await esbuild.build({
  entryPoints: ["src/main.js"],
  bundle: true,
  format: "esm",
  target: ["es2022"],
  outfile: "public/dist/bundle.js",
  minify: true,
  sourcemap: false
});

await copyFile("service-worker.js", "public/service-worker.js");
console.log("Build complete: public/dist/bundle.js + public/service-worker.js");
