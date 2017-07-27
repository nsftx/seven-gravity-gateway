const Clean = require('clean-webpack-plugin');
const Uglify = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: {
        'index' : './index.js',
        'index.min' : './index.js',
        'master': './master.js',
        'master.min': './master.js',
        'slave': './slave.js',
        'slave.min': './slave.js',
        'plugin-storage': './plugin-storage.js',
        'plugin-storage.min': './plugin-storage.js'
    },
    plugins: [
        new Clean(['dist']),
        new Uglify({
            include: /\.min\.js$/i,
            minimize: true
        })
    ],
    output: {
        filename: '[name].js',
        path: __dirname + '/dist',
        library: ['gravity', 'gateway'],
        libraryTarget: 'umd',
        umdNamedDefine: true
    }
};