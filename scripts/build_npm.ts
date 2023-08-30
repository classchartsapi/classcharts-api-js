import { build, emptyDir } from "https://deno.land/x/dnt@0.38.1/mod.ts";

if (!Deno.args[0]) throw new Error("No version specified");

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  packageManager: "pnpm",
  compilerOptions: {
    lib: ["DOM", "ESNext"],
  },
  typeCheck: "both",
  package: {
    // package.json properties
    name: "classcharts-api",
    author: {
      name: "James Cook",
      email: "james@jaminit.co.uk",
    },
    version: Deno.args[0],
    description:
      "A Typescript wrapper for getting information from the ClassCharts API",
    license: "ISC",
    keywords: ["node", "typescript", "classcharts", "class charts"],
    bugs: {
      url: "https://github.com/classchartsapi/classcharts-api-js/issues",
    },
    repository: {
      type: "git",
      url: "https://github.com/classchartsapi/classcharts-api-js.git",
    },
    homepage: "https://classchartsapi.github.io/classcharts-api-js/",
    types: "./mod.ts",
    engines: {
      node: ">=18",
    },
    sideEffects: false,
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("readme.md", "npm/README.md");
  },
});
