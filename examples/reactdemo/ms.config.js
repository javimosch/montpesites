const VueLoaderPlugin = require('vue-loader/lib/plugin')
const webpack = require('webpack')

module.exports = async app => {
    return {
        env: {
            defaultLanguage: 'en'
        },
        plugins: {
            cleanDistFolders: {
                preserveFolders: ['img'],
                filesGlob: '*.app.js',
                enabled: true // process.env.NODE_ENV === 'production'
            },
            webpackBundling: {
                middlewareOptions: {
                    // logLevel: 'info'
                },
                webpackOptions: {
                    devtool: process.env.NODE_ENV === 'production' ? undefined : 'eval'
                },
                watchUnder: 'js/',
                compileOnRequest: true,
                replaceRules: true,
                module: {
                    rules: [{
                            test: /\.css$/i,
                            use: ['style-loader', 'css-loader']
                        },
                        {
                            test: /\.m?js$/,
                            exclude: /(node_modules|bower_components)/,
                            use: {
                                loader: 'babel-loader',
                                options: {
                                    presets: [
                                        '@babel/preset-env', [
                                            '@babel/preset-react',
                                            {
                                                pragma: 'dom', // default pragma is React.createElement
                                                pragmaFrag: 'DomFrag', // default is React.Fragment
                                                throwIfNamespace: false // defaults to true
                                            }
                                        ]
                                    ],
                                    plugins: [
                                        [
                                            '@babel/plugin-transform-react-jsx',
                                            {
                                                // pragma: 'Preact.h', // default pragma is React.createElement
                                                // pragmaFrag: 'Preact.Fragment', // default is React.Fragment
                                                // throwIfNamespace: false // defaults to true
                                            }
                                        ],
                                        [
                                            '@babel/plugin-transform-runtime',
                                            {
                                                absoluteRuntime: false,
                                                corejs: false,
                                                helpers: true,
                                                regenerator: true,
                                                useESModules: false
                                            }
                                        ]
                                    ]
                                }
                            }
                        }
                    ]
                },
                plugins: [new webpack.HotModuleReplacementPlugin()]
            }
        },
        bundles: {
            app: {
                source: 'js/app.js',
                target: '/app.js',
                bundler: 'webpack',
                framework: 'react'
            }
        }
    }
}