const rimraf = require('rimraf')
const sander = require('sander')
module.exports = async(app, pluginpluginOptions) => {
    return {
        position: 'beforeFullBuild',
        async execute(params = {}, pluginOptions = {}) {
            let dirs = await sander.readdir(
                require('path').join(process.cwd(), app.config.distFolder)
            )
            await Promise.all(
                dirs
                .filter(dir => {
                    return dir.indexOf('.') === -1
                })
                .filter(dir => {
                    if (pluginOptions.preserveFolders) {
                        return !pluginOptions.preserveFolders.includes(dir)
                    } else {
                        return true
                    }
                })
                .map(dir => {
                    return (async() => {
                        let rimrafPath = require('path').join(
                            process.cwd(),
                            app.config.distFolder,
                            dir
                        )
                        await rimrafPromise(rimrafPath)
                    })()
                })
            )

            if (pluginOptions.filesGlob) {
                let rimrafPath = require('path').join(
                    process.cwd(),
                    app.config.distFolder,
                    pluginOptions.filesGlob
                )
                await rimrafPromise(rimrafPath)
            }
        }
    }
}

function rimrafPromise(glob) {
    return new Promise((resolve, reject) => {
        try {
            rimraf(glob, err => {
                if (err) {
                    return reject(err)
                }
                resolve()
            })
        } catch (err) {
            reject(err)
        }
    })
}