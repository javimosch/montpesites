module.exports = {
    start(app, options = {}) {
        return require('./src/server').startServer(app, options)
    }
}