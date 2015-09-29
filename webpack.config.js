'use strict';

var webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    path = require('path'),
    srcPath = path.join(__dirname, 'js');

module.exports = {
    target: 'web',
    cache: true,
    entry: {
        module: path.join(srcPath, 'app.js'),
        common: ['react', 'react-router']
    },
    resolve: {
        root: srcPath,
        extensions: ['', '.js'],
        modulesDirectories: ['node_modules', 'js']
    },
    output: {
        path: path.join(__dirname, 'tmp'),
        publicPath: '',
        filename: '[name].js',
        library: ['Example', '[name]'],
        pathInfo: true
    },

    module: {
        loaders: [
        {test: /\.js?$/, exclude: /node_modules/, loader: 'babel?cacheDirectory'},
        {test: /\.css$/, loader: 'style-loader!css-loader'}
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('common', 'common.js'),
        new HtmlWebpackPlugin({
            inject: true,
            template: 'index.html'
        }),
        new webpack.NoErrorsPlugin()
    ],

    debug: true,
    devtool: 'eval-cheap-module-source-map',
    devServer: {
        contentBase: './tmp',
        historyApiFallback: true
    }
};
