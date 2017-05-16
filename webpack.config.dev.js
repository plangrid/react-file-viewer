const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  devtool: "cheap-module-source-map",

  entry: {
    app: [
      "webpack-dev-server/client?http://localhost:8080/",
      "webpack/hot/dev-server",
      path.resolve(__dirname, "./src/app.js"),
    ],
  },
  output: {
    path: path.resolve(__dirname, "./build"),
    pathinfo: true,
    filename: "app/js/[name].bundle.js",
    publicPath: "/",
  },
  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    extensions: [".js", ".json", ".jsx"],
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: path.resolve(__dirname, "./src"),
        loader: "babel-loader",
        options: {
          cacheDirectory: true,
        },
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, "./index.html"),
    }),
    new webpack.HotModuleReplacementPlugin(),
  ]
};
