module.exports = (app, config) =>
    async function readAppsFolder() {
        let msPath = require('../config').msRealRootPath
        return await require('sander').readdir(require('path').join(msPath, 'apps'))
    }