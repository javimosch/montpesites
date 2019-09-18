const moment = require('moment-timezone')
const sander = require('sander')
const requireFromString = require('require-from-string')
var now = () =>
    moment()
    .tz('Europe/Paris')
    .format('DD-MM-YY HH:mm:ss')
const timeSpan = require('time-span')

var cachedPlugins = {}

module.exports = {
    async runPluginsWithPosition(position, app, args = {}) {
        let plugins = app.config.plugins
        if (!plugins) return
        await Promise.all(
            Object.keys(plugins).map(pluginName => {
                // console.log(`Reading plugin`, pluginName)
                return (async() => {
                    let pluginOptions = plugins[pluginName]

                    let plugin = null

                    if (!cachedPlugins[pluginName]) {
                        plugin = require('path').join(
                            __dirname,
                            'plugins',
                            `${pluginName}.js`
                        )
                        if (!(await sander.exists(plugin))) {
                            console.log(now(), `Invalid plugin ${pluginName}`)
                            return null
                        }
                        plugin = (await sander.readFile(plugin)).toString('utf-8')
                        plugin = requireFromString(plugin)

                        var debug = (() => {
                            return function() {
                                var args = Array.prototype.slice.call(arguments)
                                args.unshift(pluginName)
                                args.unshift('Plugin')
                                args.unshift(now())
                                console.log.apply(console, args)
                            }
                        })()

                        plugin = await plugin(app, pluginOptions, debug)
                        cachedPlugins[pluginName] = plugin
                    } else {
                        plugin = cachedPlugins[pluginName]
                    }

                    if (plugin instanceof Array) {
                        plugin = plugin.find(pluginItem => pluginItem.position == position)
                    }

                    if (plugin && plugin.position == position) {
                        pluginOptions.enabled =
                            pluginOptions.enabled === undefined ? true : pluginOptions.enabled
                        if (!pluginOptions.enabled) {
                            return
                        }

                        try {
                            const end = timeSpan()
                            await plugin.execute(args, pluginOptions)
                            console.log(
                                now(),
                                'Plugin',
                                `${position} ${pluginName} took `,
                                end.seconds().toFixed(3)
                            )
                        } catch (err) {
                            console.log(now(), `${position} errored`, {
                                err: err.stack
                            })
                        }
                    }
                })()
            })
        )
    }
}