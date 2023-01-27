const Clean = require('clean-webpack-plugin');
const Uglify = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

// Webpack accepts array of configurations
// https://github.com/webpack/webpack/issues/1189#issuecomment-227133370

module.exports = [
    {
        entry: {
            'index' : './index.js',
            'master': './master.js',
            'slave': './slave.js',
            'plugin-storage': './plugin-storage.js',
            'plugin-scan': './plugin-barcode-scan.js',
        },
        plugins: [
            new Clean(['dist']),
        ],
        output: {
            filename: '[name].js',
            path: __dirname + '/dist',
            library: ['gravity', 'gateway', '[name]'],
            libraryTarget: 'umd',
            umdNamedDefine: true
        }
    },
    {
        entry: {
            'index' : './index.js',
            'master': './master.js',
            'slave': './slave.js',
            'plugin-storage': './plugin-storage.js',
            'plugin-scan': './plugin-barcode-scan.js'
        },
        plugins: [
            new Uglify({
                include: /\.js$/i
            })
        ],
        output: {
            filename: '[name].min.js',
            path: __dirname + '/dist',
            library: ['gravity', 'gateway', '[name]'],
            libraryTarget: 'umd',
            umdNamedDefine: true
        }
    }
];
