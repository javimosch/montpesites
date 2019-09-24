module.exports = function(options = {}) {
    let res = {}
    require('colors')
    if (options.dotenv) {
        require('dotenv').config({
            silent: true
        })
    }

    res.argv = require('yargs').argv

    const moment = require('moment-timezone')
    res.moment = moment

    res.now = () =>
        moment()
        .tz('Europe/Paris')
        .format('DD-MM-YY HH:mm:ss')
    return res
}