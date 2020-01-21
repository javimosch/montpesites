module.exports = (app, config) =>
    async function getProjectByFolderName(name) {
        let msPath = require('../config').msRealRootPath
        let pages = require('path').join(msPath, 'apps', name, 'src', 'pages')
        pages = await require('sander').readdir(pages)
        return {
            folderName: name,
            pages
        }
    }