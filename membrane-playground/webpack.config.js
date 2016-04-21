'use strict'

const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: [
    'babel-polyfill',
    './src/index.js'
  ],
  output: {
    path: 'dist',
    filename: 'bundle.js'
  },
  devtool: 'sourcemap',
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /(node_modules)/,
      loader: 'babel'
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Mitochondria',
      template: './src/index.html'
    }),
    // TODO exclude .DS_Store
    new CopyWebpackPlugin([{
      from: 'public'
    }, {
      from: 'node_modules/three/three.min.js',
      to: 'js'
    }, {
      from: 'node_modules/three/examples/js/loaders/OBJLoader.js',
      to: 'js'
    }, {
      from: 'node_modules/three/examples/js/controls/OrbitControls.js',
      to: 'js'
    },  {
      from: 'node_modules/three/examples/js/controls/FlyControls.js',
      to: 'js'
    }, {
      from: 'node_modules/goblinphysics/build/goblin.js',
      to: 'js'
    }])
  ]
}
