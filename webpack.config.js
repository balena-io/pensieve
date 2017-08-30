const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const BUILD_DIR = 'build';

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'pensieve.js',
    path: path.resolve(__dirname, BUILD_DIR),
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  node: {
    fs: 'empty',
  },
  plugins: [new CleanWebpackPlugin([BUILD_DIR]), new UglifyJSPlugin()],
};
