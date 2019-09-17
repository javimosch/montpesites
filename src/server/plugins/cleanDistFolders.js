const rimraf = require('rimraf')
const sander = require('sander')
module.exports = async app => {
    return {
        position: 'beforeFullBuild',
        async execute(options = {}) {
            let dirs = await sander.readdir(
                require('path').join(process.cwd(), app.config.distFolder)
            )
            await Promise.all(
                dirs
                .filter(dir => {
                    return dir.indexOf('.') === -1
                })
                .filter(dir => {
                    if (options.preserveFolders) {
                        return !options.preserveFolders.includes(dir)
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