/** @type {import('typedoc-plugin-umami').TypeDocOptions} */
module.exports = {
  entryPointStrategy: "resolve",
  plugin: ["typedoc-plugin-umami"],
  entryPoints: [
    "src/core/studentClient.ts",
    "src/core/parentClient.ts",
    "src/core/baseClient.ts",
    "src/types.ts",
  ],
  navigationLinks: {
    Discord: "https://discord.gg/DTcwugcgZ2",
    Github: "https://github.com/classchartsapi/classcharts-api-js",
  },
  includeVersion: true,
  out: "docs",
  sort: "required-first",
  umamiOptions: {
    src: "https://umami.jaminit.co.uk/script.js",
    websiteId: "dd8c53b8-dc99-484c-911d-b08c898498a8",
  },
};
