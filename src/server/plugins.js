const moment = require('moment-timezone')
const sander = require('sander')
const requireFromString = require('require-from-string')
var now = () =>
    moment()
    .tz('Europe/Paris')
    .format('DD-MM-YY HH:mm:ss')
const timeSpan = require('time-span')

module.exports = {
    async runPluginsWithPosition(position, app, args = {}) {
        let plugins = app.config.plugins
        if (!plugins) return
        await Promise.all(
            Object.keys(plugins).map(plugginName => {
                return (async() => {
                    let plugin = require('path').join(
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
                    plugin = await plugin(app)

                    if (plugin instanceof Array) {
                        plugin = plugin.find(pluginItem => pluginItem.position == position)
                    }

                    if (plugin && plugin.position == position) {
                        let options = plugins[plugginName]
                        options.enabled =
                            options.enabled === undefined ? true : options.enabled
                        if (!options.enabled) {
                            return
                        }

                        try {
                            const end = timeSpan()
                            await plugin.execute(options, args)
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