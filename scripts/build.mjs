import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
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

const bundleSource = await readFile("public/dist/bundle.js", "utf8");
const buildId = createHash("sha256").update(bundleSource).digest("hex").slice(0, 12);

const swTemplate = await readFile("service-worker.js", "utf8");
const swOutput = swTemplate.replace("__BUILD_ID__", buildId);
await writeFile("public/service-worker.js", swOutput, "utf8");

console.log("Build complete: public/dist/bundle.js + public/service-worker.js");
