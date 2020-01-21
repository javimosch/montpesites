require('./src/server/config').msRealRootPath = __dirname

module.exports = {
    start(app, options = {}) {
        return require('./src/server').startServer(app, options)
    }
}