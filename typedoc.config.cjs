/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  entryPointStrategy: "resolve",
  entryPoints: [
    "src/studentClient.ts",
    "src/parentClient.ts",
    "src/baseClient.ts",
    "src/types.ts",
  ],
  navigationLinks: {
    Discord: "https://discord.gg/DTcwugcgZ2",
    Github: "https://github.com/classchartsapi/classcharts-api-js",
  },
  includeVersion: true,
  out: "docs",
  sort: "required-first",
};
