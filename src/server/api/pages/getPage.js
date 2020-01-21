module.exports = (app, config) =>
    async function getPage({ pageName, projectFolderName }) {
        let msPath = require('../../config').msRealRootPath
        let pageConfig = await require('sander').readFile(
            require('path').join(
                msPath,
                'apps',
                projectFolderName,
                'src/pages',
                pageName,
                'index.js'
            )
        )
        pageConfig = pageConfig.toString('utf-8')
        return {
            contents: 'FOO'
                // config: pageConfig
        }
    }