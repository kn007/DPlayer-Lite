const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {

    mode: 'production',

    bail: true,

    entry: {
        DPlayer: './src/js/index.js'
    },

    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: '[name].min.js',
        library: '[name]',
        libraryTarget: 'umd',
        libraryExport: 'default',
        umdNamedDefine: true,
        publicPath: '/'
    },

    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.scss']
    },

    module: {
        strictExportPresence: true,
        rules: [
            {
                test: /\.js$/,
                use: [
                    'template-string-optimize-loader',
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            presets: ['@babel/preset-env']
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            sourceMap: false
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [autoprefixer, cssnano]
                        }
                    },
                    'sass-loader',
                ]
            },
            {
                test: /\.(png|jpg)$/,
                loader: 'url-loader',
                options: {
                    limit: 40000
                }
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },
            {
                test: /\.art$/,
                loader: 'art-template-loader'
            }
        ]
    },

    plugins: [
    ],

    node: {
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
    }

};
