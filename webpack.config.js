'use strict';
/* globals __dirname, require, module */
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: ['webpack/hot/dev-server', './node_modules/babel-polyfill', './src/main'],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['', '.js']
    },
    devtool: 'sourcemap',
    module: {
        loaders: [{
            test: /\.js?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel',
            query: {
                cacheDirectory: true,
                presets: ['es2015']
            }
        }]
    },
    plugins: [
        new OpenBrowserPlugin({ url: 'http://localhost:8080' }),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        contentBase: path.resolve(__dirname, 'app'),
        colors: true,
        hot: false
    }
};
