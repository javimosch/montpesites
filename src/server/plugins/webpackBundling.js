const sander = require('sander')
const moment = require('moment-timezone')
const webpack = require('webpack')
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
    if (process.env.NODE_ENV !== 'production') {
        bindWebpackMiddleware()
    } else {
        // Modules are compiled in the beforeFullBuild hook
    }

    async function compileSingleModule(moduleName) {
        return new Promise(async(resolve, reject) => {
            let module = app.config.bundles[moduleName]
            let entry = require('path').join(process.cwd(), 'src', module.source)
            let output = require('path').join(
                process.cwd(),
                app.config.distFolder,
                module.target
            )
            let filename = output.substr(output.lastIndexOf('/') + 1)
            output = {
                path: output.substring(0, output.lastIndexOf('/')),
                filename: `[name].${filename}`
            }

            if (!(await sander.exists(entry))) {
                await sander.writeFile(output, `INVALID SOURCE`)
                if (res) {
                    res.sendFile(output)
                }
                return
            }

            pluginOptions = Object.assign({}, pluginOptions, {
                output,
                entry
            })

            const end = timeSpan()
            webpack(getWebpackConfig(pluginOptions), async(err, stats) => {
                if (err || (stats && stats.hasErrors())) {
                    onerror(err, stats, res)
                } else {
                    debug(
                        require('path').basename(entry),
                        `Bundled in`,
                        end.seconds().toFixed(3)
                    )
                    resolve()
                }
            })
        })
    }

    function bindWebpackMiddleware() {
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

            output = {
                filename: options.output.substring(options.output.lastIndexOf('/') + 1),
                path: options.output.substring(0, options.output.lastIndexOf('/') + 1),
                publicPath: '/'
            }
            options.output = output

            Object.assign(options, pluginOptions.webpackOptions || {})

            const compiler = webpack(getWebpackConfig(options))
            let middlewareOptions = {
                lazy: false,
                logLevel: 'error',
                logTime: true,
                publicPath: '/',
                writeToDisk: pluginOptions.writeToDisk === undefined ?
                    false :
                    pluginOptions.writeToDisk,
                watchOptions: {
                    aggregateTimeout: 200
                }
            }
            Object.assign(middlewareOptions, pluginOptions.middlewareOptions || {})
            app.use(webpackDevMiddleware(compiler, middlewareOptions))
            app.use(require('webpack-hot-middleware')(compiler))
        })
    }

    return [{
            position: 'beforeFullBuild',
            async execute(params = {}) {
                if (process.env.NODE_ENV === 'production') {
                    await Promise.all(
                        Object.keys(app.config.bundles).map(key => {
                            return (async() => {
                                await compileSingleModule(key, pluginOptions)
                            })()
                        })
                    )
                }
            }
        },
        {
            position: 'watch:js',
            async execute(params = {}, pluginOptions = {}) {
                return // DISABLED
                if (!app.config && !app.config.bundles) return
                let matchedModuleKey = Object.keys(app.config.bundles).find(name => {
                    let module = app.config.bundles[name]
                    return module.source == params.path
                })
                let isWatchUnder = !!pluginOptions.watchUnder &&
                    params.path.indexOf(pluginOptions.watchUnder) != -1
                if (matchedModuleKey) {
                    await compileSingleModule(matchedModuleKey)
                }
                if (isWatchUnder) {
                    await Promise.all(
                        Object.keys(app.config.bundles).map(key => {
                            return (async() => {
                                await compileSingleModule(key)
                            })()
                        })
                    )
                }
            }
        }
    ]
}

function getWebpackConfig(pluginOptions) {
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
        watch: process.env.NODE_ENV !== 'production',
        cache: true,
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
        entry: pluginOptions.entry,
        output: pluginOptions.output,
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