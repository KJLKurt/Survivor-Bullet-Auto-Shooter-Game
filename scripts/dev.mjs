import { copyFile } from "node:fs/promises";
import esbuild from "esbuild";

const port = Number(process.env.PORT ?? 4173);

const copyServiceWorkerPlugin = {
  name: "copy-service-worker",
  setup(build) {
    build.onEnd(async () => {
      await copyFile("service-worker.js", "public/service-worker.js");
      console.log("Copied service-worker.js");
    });
  }
};

const context = await esbuild.context({
  entryPoints: ["src/main.js"],
  bundle: true,
  format: "esm",
  target: ["es2022"],
  outfile: "public/dist/bundle.js",
  sourcemap: true,
  plugins: [copyServiceWorkerPlugin]
});

await context.watch();
const server = await context.serve({ servedir: "public", port });
const host = server.host ?? "localhost";

console.log(`Dev server: http://${host}:${server.port}`);
console.log("Press Ctrl+C to stop.");
