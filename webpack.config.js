module.exports = {
    entry: ['./src/main'],
    output: {
        path: __dirname,
        filename: 'index.js'
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
    }
};
