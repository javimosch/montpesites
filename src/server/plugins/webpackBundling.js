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

module.exports = async app => {
    const sander = require('sander')
    var bundlerMiddleware = createWebpackBundlerMiddleware()

    async function executeBundlerMiddleware(moduleName, req, res) {
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
            output
        })(req, res)
    }

    if (process.env.NODE_ENV !== 'production') {
        app.use((req, res, next) => {
            if (app.config.bundles) {
                let matchedModuleKey = Object.keys(app.config.bundles).find(name => {
                    let module = app.config.bundles[name]
                    return module.target === req.url
                })
                if (matchedModuleKey) {
                    executeBundlerMiddleware(matchedModuleKey, req, res)
                } else {
                    next()
                }
            } else {
                next()
            }
        })
    }

    return [{
            position: 'beforeFullBuild',
            async execute(options = {}) {}
        },
        {
            position: 'watch:js',
            async execute(options = {}, params) {
                let matchedModuleKey = Object.keys(app.config.bundles).find(name => {
                    let module = app.config.bundles[name]
                    return module.source == params.path
                })
                if (matchedModuleKey) {
                    executeBundlerMiddleware(matchedModuleKey, null, null)
                }
            }
        }
    ]
}

function createWebpackBundlerMiddleware() {
    const sander = require('sander')
    let cache = {}
    return function webpackMiddleware(options = {}) {
        return function webpackMiddlewareInstance(req, res) {
            // serve from cache if middleware and production
            if (
                process.env.NODE_ENV === 'production' &&
                !!cache[options.entry + '_' + options.output] &&
                !!res
            ) {
                return res.sendFile(options.output)
            }

            const webpack = require('webpack')
            let output = {
                filename: options.output.substring(options.output.lastIndexOf('/') + 1),
                path: options.output.substring(0, options.output.lastIndexOf('/') + 1)
            }
            const end = timeSpan()
            webpack({
                    mode: process.env.NODE_ENV === 'production' ?
                        'production' :
                        'development',
                    entry: options.entry,
                    output,
                    module: getModuleSection()
                },
                async(err, stats) => {
                    if (err || (stats && stats.hasErrors())) {
                        var errors = ''
                        if (!stats.errors &&
                            stats.compilation &&
                            stats.compilation.errors
                        ) {
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
                    } else {
                        if (res) {
                            let raw = (await sander.readFile(options.output)).toString(
                                'utf-8'
                            )
                            if (options.transform) {
                                raw = options.transform(raw, req)
                                if (raw instanceof Promise) {
                                    raw = await raw
                                }
                            }
                            res.header('Content-Type', 'text/javascript')
                            res.send(raw)
                        } else {
                            // await sander.writeFile(options.output, html)
                        }
                        debug(
                            require('path').basename(options.entry),
                            `Bundled in`,
                            end.seconds().toFixed(3)
                        )
                        if (process.env.NODE_ENV === 'production' && !options.transform) {
                            cache[options.entry + '_' + options.output] = true
                        }
                    }
                }
            )
        }
    }

    function getModuleSection() {
        return {
            rules: [{
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            }]
        }
    }
}