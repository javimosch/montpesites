const sander = require('sander')
const requireFromString = require('require-from-string')
module.exports = {
    async getConfig(options = {}) {
        let config = await getConfig(options)
        config.refresh = async() => {
            config = await getConfig(options)
        }
        return config
    }
}

async function getConfig(options = {}) {
    let configPath = require('path').join(
        options.cwd || process.cwd(),
        'ms.config.js'
    )
    var configData = (await sander.readFile(configPath)).toString('utf-8')
    let config = requireFromString(configData)
    config = config(options)
    if (config instanceof Promise) {
        config = await config
    }
    config.env = Object.assign({}, process.env, config.env || {})
    return config
}