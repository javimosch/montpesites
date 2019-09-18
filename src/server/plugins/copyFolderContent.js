module.exports = async(app, options, debug) => {
    let src = require('path').join(process.cwd(), 'src', options.source)

    if (app.config.env.NODE_ENV != 'production') {
        const timeSpan = require('time-span')
        var chokidar = require('chokidar')
        chokidar
            .watch(src, {
                ignored: ['**/node_modules/**/*', '**/.git/**/*', /(^|[\/\\])\../]
            })
            .on('change', (path, stats) => {
                const end = timeSpan()
                execute().then(() => {
                    debug(end.seconds().toFixed(3))
                })
            })
    }

    return {
        position: 'beforeFullBuild',
        async execute(params = {}, options = {}) {
            await execute()
        }
    }

    async function execute() {
        const reflect = require('@alumna/reflect')
        let dest = require('path').join(process.cwd(), app.config.distFolder)
        let { res, err } = await reflect({
            src,

            dest,

            // (OPTIONAL) Default to 'true'
            recursive: true,

            // (OPTIONAL) Default to 'true'
            // Delete in dest the non-existent files in src
            delete: false,

            // (OPTIONAL)
            // Array with files and folders not to reflect
            exclude: options.exclude || []
        })

        if (err) throw err
    }
}