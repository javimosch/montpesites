const VueLoaderPlugin = require('vue-loader/lib/plugin')
const webpack = require('webpack')

module.exports = async app => {
    return {
        env: {
            defaultLanguage: 'en'
        },
        plugins: {
            generateSitemap: {},
            cleanDistFolders: {
                preserveFolders: ['img'],
                enabled: true // process.env.NODE_ENV === 'production'
            },
            webpackBundling: {
                webpackOptions: {
                    devtool: process.env.NODE_ENV === 'production' ? undefined : 'eval'
                },
                watchUnder: 'js/',
                compileOnRequest: true,
                replaceRules: true,
                module: {
                    rules: [{
                            test: /\.vue$/,
                            loader: 'vue-loader'
                        },
                        {
                            test: /\.js$/,
                            loader: 'babel-loader'
                        },
                        {
                            test: /\.scss$/,
                            use: ['vue-style-loader', 'css-loader', 'sass-loader']
                        },
                        {
                            test: /\.css$/,
                            use: ['vue-style-loader', 'css-loader']
                        },
                        {
                            test: /\.pug$/,
                            loader: 'pug-plain-loader'
                        }
                    ]
                },
                plugins: [
                    // make sure to include the plugin!
                    new webpack.HotModuleReplacementPlugin(),
                    new VueLoaderPlugin()
                ]
            }
        },
        bundles: {
            app: {
                source: 'js/app.js',
                target: '/app.js',
                bundler: 'webpack'
            }
        }
    }
}