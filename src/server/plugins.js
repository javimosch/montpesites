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
            Object.keys(plugins).map(plugginName => {
                return (async() => {
                    let pluginOptions = plugins[plugginName]

                    let plugin = null

                    if (!cachedPlugins[plugginName]) {
                        plugin = require('path').join(
                            __dirname,
                            'plugins',
                            `${plugginName}.js`
                        )
                        if (!(await sander.exists(plugin))) {
                            console.log(now(), `Invalid plugin ${plugginName}`)
                            return null
                        }
                        plugin = (await sander.readFile(plugin)).toString('utf-8')
                        plugin = requireFromString(plugin)
                        plugin = await plugin(app, pluginOptions)
                        cachedPlugins[plugginName] = plugin
                    } else {
                        plugin = cachedPlugins[plugginName]
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
                                `${position} ${plugginName} took `,
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