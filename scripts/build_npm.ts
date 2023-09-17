import { build, emptyDir } from "~/deps_dev.ts";

if (!Deno.args[0]) throw new Error("No version specified");

await emptyDir("./npm");

await build({
  entryPoints: [{
    name: ".",
    path: "./mod.ts",
  }, {
    name: "./types",
    path: "./src/types.ts",
  }],
  outDir: "./npm",
  importMap: "./deno.jsonc",
  shims: {
    deno: true,
  },
  packageManager: "pnpm",
  compilerOptions: {
    lib: ["DOM", "ESNext"],
  },
  typeCheck: "both",
  package: {
    name: "classcharts-api",
    version: String(Deno.args[0]).replace("v", ""),
    author: {
      name: "James Cook",
      email: "james@jaminit.co.uk",
    },
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
    engines: {
      node: ">=18",
    },
    sideEffects: false,
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
