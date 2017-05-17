const webpack = require('webpack');
const path = require('path');
const autoprefixer = require("autoprefixer");

var BUILD_DIR = path.resolve(__dirname, './dist');
var APP_DIR = path.resolve(__dirname, './src');

var config = {
  entry: APP_DIR + '/components/index.js',
  output: {
    path: BUILD_DIR,
    filename: 'index.js'
  },
  resolve: {
    modules: [path.resolve(__dirname, "./src"), "node_modules"],
    extensions: ['.js', '.jsx', '.json'],
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
      {
        test: /\.(css|scss)$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              plugins: () => [
                autoprefixer({
                  browsers: [
                    ">1%",
                    "last 4 versions",
                    "not ie < 9",
                  ],
                }),
              ],
            },
          },
          {
            loader: "sass-loader",
          },
        ],
      },
    ],
  },
};

module.exports = config;
