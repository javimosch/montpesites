const moment = require('moment-timezone')
var now = () =>
    moment()
    .tz('Europe/Paris')
    .format('DD-MM-YY HH:mm:ss')
const timeSpan = require('time-span')

var debug = function() {
    var args = Array.prototype.slice.call(arguments)
    args.unshift('webpackBundling-plugin')
    args.unshift(now())
    console.log.apply(console, args)
}

module.exports = async(app, pluginOptions) => {
    const sander = require('sander')
    var bundlerMiddleware = createWebpackBundlerMiddleware()

    async function executeBundlerMiddleware(moduleName, req, res) {
        return new Promise(async(resolve, reject) => {
            let module = app.config.bundles[moduleName]
            let entry = require('path').join(process.cwd(), 'src', module.source)
            let output = require('path').join(
                process.cwd(),
                app.config.distFolder,
                module.target
            )

            if (!(await sander.exists(entry))) {
                await sander.writeFile(output, `INVALID SOURCE`)
                if (res) {
                    res.sendFile(output)
                }
                return
            }

            bundlerMiddleware({
                entry,
                output,
                pluginOptions,
                callback: err => {
                    resolve()
                }
            })(req, res)
        })
    }

    if (process.env.NODE_ENV !== 'production') {
        const webpack = require('webpack')
        const webpackDevMiddleware = require('webpack-dev-middleware')
        Object.keys(app.config.bundles).forEach(moduleName => {
            let module = app.config.bundles[moduleName]
            let entry = require('path').join(process.cwd(), 'src', module.source)
            let output = require('path').join(
                process.cwd(),
                app.config.distFolder,
                module.target
            )
            let options = Object.assign({}, pluginOptions, {
                output,
                entry
            })
            options.entry = [
                'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
                options.entry
            ]
            const compiler = webpack(getWebpackConfig(options))
            let middlewareOptions = {
                    lazy: false,
                    logLevel: 'info',
                    logTime: true,
                    publicPath: '/',
                    writeToDisk: false,
                    watchOptions: {
                        aggregateTimeout: 200
                    }
                }
                // console.log('ADDING MIDDLEWARE', middlewareOptions)
            app.use(webpackDevMiddleware(compiler, middlewareOptions))
            app.use(require('webpack-hot-middleware')(compiler))
        })

        /*

                                            app.use((req, res, next) => {
                                                if (app.config.bundles && pluginOptions.compileOnRequest === true) {
                                                    let matchedModuleKey = Object.keys(app.config.bundles).find(name => {
                                                        let module = app.config.bundles[name]
                                                        return module.target === req.url
                                                    })
                                                    if (matchedModuleKey) {
                                                        executeBundlerMiddleware(matchedModuleKey, req, res, pluginOptions)
                                                    } else {
                                                        next()
                                                    }
                                                } else {
                                                    next()
                                                }
                                            }) */
    }

    return [{
            position: 'beforeFullBuild',
            async execute(params = {}) {
                await Promise.all(
                    Object.keys(app.config.bundles).map(key => {
                        return (async() => {
                            // executeBundlerMiddleware(key, null, null, pluginOptions)
                        })()
                    })
                )
            }
        },
        {
            position: 'watch:js',
            async execute(params = {}, pluginOptions = {}) {
                if (!app.config && !app.config.bundles) return
                let matchedModuleKey = Object.keys(app.config.bundles).find(name => {
                    let module = app.config.bundles[name]
                    return module.source == params.path
                })
                let isWatchUnder = !!pluginOptions.watchUnder &&
                    params.path.indexOf(pluginOptions.watchUnder) != -1
                if (matchedModuleKey) {
                    /* await executeBundlerMiddleware(
                                                                                                                  matchedModuleKey,
                                                                                                                  null,
                                                                                                                  null,
                                                                                                                  pluginOptions
                                                                                                              ) */
                }
                if (isWatchUnder) {
                    await Promise.all(
                        Object.keys(app.config.bundles).map(key => {
                            return (async() => {
                                // await executeBundlerMiddleware(key, null, null, pluginOptions)
                            })()
                        })
                    )
                }
            }
        }
    ]
}

function getWebpackConfig(pluginOptions) {
    let output = {
        filename: pluginOptions.output.substring(
            pluginOptions.output.lastIndexOf('/') + 1
        ),
        path: pluginOptions.output.substring(
            0,
            pluginOptions.output.lastIndexOf('/') + 1
        ),
        publicPath: '/'
    }
    let module = {
        rules: [{
            test: /\.css$/i,
            use: ['style-loader', 'css-loader']
        }]
    }

    if (pluginOptions.module && pluginOptions.module.rules) {
        if (pluginOptions.replaceRules) {
            module.rules = pluginOptions.module.rules
        } else {
            module.rules = module.rules.concat(pluginOptions.module.rules)
        }
    }

    var plugins = []
    if (pluginOptions.plugins) {
        plugins = plugins.concat(pluginOptions.plugins)
    }
    return {
        cache: true,
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
        entry: pluginOptions.entry,
        output,
        module,
        plugins,
        performance: {
            maxEntrypointSize: 1250000,
            maxAssetSize: 1250000,
            hints: 'warning'
        },
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all'
                    }
                }
            }
        }
    }
}

function createWebpackBundlerMiddleware() {
    const sander = require('sander')
    return function webpackMiddleware(options = {}) {
        let pluginOptions = Object.assign({}, options.pluginOptions, {
            output: options.output,
            entry: options.entry
        })
        return function webpackMiddlewareInstance(req, res) {
            const webpack = require('webpack')
            const end = timeSpan()
            webpack(getWebpackConfig(pluginOptions), async(err, stats) => {
                if (err || (stats && stats.hasErrors())) {
                    onerror(err, stats, res)
                } else {
                    debug(
                        require('path').basename(options.entry),
                        `Bundled in`,
                        end.seconds().toFixed(3)
                    )
                    if (options.callback) options.callback()
                }
            })
        }
    }
}

function onerror(err, stats, res) {
    var errors = ''
    if (!stats.errors && stats.compilation && stats.compilation.errors) {
        stats.errors = stats.compilation.errors
    }
    if (stats.errors && stats.errors.length > 0) {
        try {
            errors = JSON.stringify(stats.errors || [], null, 4).red
        } catch (err) {
            errors = stats.errors
        }
    } else {
        errors = {
            err: (err && err.stack) || err,
            warnings: stats.warnings,
            errors: stats.errors
        }
    }
    debug('ERROR'.red, errors)
    if (res) {
        res.status(500).send()
    }
}