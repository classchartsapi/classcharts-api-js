/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    library: {
      name: "classchartsapi",
      type: "umd",
    },
    sourceMapFilename: "classcharts-api.map",
    path: path.resolve(__dirname, "build"),
    filename: "classcharts-api.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
