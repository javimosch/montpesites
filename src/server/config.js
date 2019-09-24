const sander = require('sander')
const requireFromString = require('require-from-string')
const argv = require('yargs').argv

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
    if (process.env.NODE_ENV !== 'production') {
        if (argv.build || argv.serve) {
            process.env.NODE_ENV = 'production'
        } else {
            process.env.NODE_ENV = 'development'
        }
    }

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

    config.env.PORT = argv.port || process.env.PORT || 3000
    config.argv = argv

    return config
}