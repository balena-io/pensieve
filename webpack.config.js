const webpack = require('webpack');
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
  plugins: [
    // Degine 'production' node environment for build
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),

    // Clean the build directory
    new CleanWebpackPlugin([BUILD_DIR]),

    // Don't load moment locales to reduce bundle size
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    // Minify build
    new UglifyJSPlugin(),
  ],
};
