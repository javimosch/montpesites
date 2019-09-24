module.exports = {
    startServer
}

function startServer(app, options = {}) {
    return new Promise((resolve, reject) => {
        let express = require('express')
        app = app || express()

        const { now, moment, argv } = require('./server/commons')()
        const projectCWD = process.cwd()
        const fs = require('fs')
        const minify = require('html-minifier').minify
        const sander = require('sander')
        const pug = require('pug')
        const handlebars = require('handlebars')
        const requireFromString = require('require-from-string')
        const plugins = require('./server/plugins.js')
        const timeSpan = require('time-span')


       

        require('./server/handlebarsTemplates')(handlebars)

        const language = require('./server/language')

        app.language = language
        app.translate = ctx => app.language.translate(ctx, app)

        if (!argv.build &&
            !argv.serve &&
            !argv.server &&
            !argv.dev &&
            !argv.watch
        ) {
            argv.dev = true
        }

        if (argv.build || argv.server || argv.serve || argv.dev) {
            buildSite()
        }

        if (argv.watch || argv.dev) {
            console.log(now(), `Watch`, require('path').basename(projectCWD))
            var chokidar = require('chokidar')
            chokidar
                .watch(projectCWD, {
                    ignored: ['**/node_modules/**/*', '**/.git/**/*', /(^|[\/\\])\../]
                })
                .on('change', (path, stats) => {
                    // console.log(now(),'Watch change', require('path').basename(path))
                    if (path.indexOf('/pages/') !== -1) {
                        let pageName = path
                            .split(require('path').join(process.cwd(), `src`))
                            .join(``)
                        pageName = pageName.split(`/pages/`).join(``)
                        pageName = pageName.substring(0, pageName.indexOf('/'))
                        console.log(now(), `Compiling page ${pageName}`)
                        setTimeout(() => {
                            buildPage(pageName)
                        }, 200)
                        return
                    }

                    if (path.indexOf('/layouts/') !== -1) {
                        setTimeout(() => {
                            buildSite()
                        }, 200)
                        return
                    }

                    if (['node_modules'].find(exclude => path.indexOf(exclude) != -1)) {
                        // ignore those
                        return
                    }

                    if (path.indexOf('/js/') != -1) {
                        let pathFromSrc = path.substr(path.lastIndexOf('/src/') + 5)
                        plugins.runPluginsWithPosition('watch:js', app, {
                            path: pathFromSrc
                        })
                    }

                    if (path.indexOf(app.config.distFolder) === -1) {
                        // console.log(`No changes ${path}`)
                    }

                    if (path.indexOf('locales.js') != -1) {
                        setTimeout(() => {
                            buildSite()
                        }, 200)
                    }
                })
        }

        var serverStarted = false

        function runServer() {
            let jest = options.jest
            if (jest || ((argv.server || argv.serve || argv.dev) && !serverStarted)) {
                serverStarted = true
                var server = require('http').Server(app)

                require('./server/funqlApi.js')(app)
                require('./server/editorApi')(app)

                const PORT = app.config.env.PORT || process.env.PORT || 3000
                server.listen(PORT)
                console.log(
                    now(),
                    `Server ready at`,
                    PORT,
                    `(${
            process.env.NODE_ENV === 'production' ? 'production' : 'development'
          })`
                )
                app.use(
                    '/',
                    express.static(
                        require('path').join(process.cwd(), app.config.distFolder)
                    )
                )
                resolve({server})
            }
        }

        async function buildPage(pageName) {
            if (argv.test) {
                // console.log(`READ PAGE CONFIG ${projectCWD}/src/pages/${pageName}/index.js`)
            }
            let jsModulePath = require('path').join(
                projectCWD,
                'src/pages',
                pageName,
                'index.js'
            )

            if (!(await sander.exists(jsModulePath))) {
                console.log('SKIP (no config file)', pageName)
                return
            }

            var jsModule = (await sander.readFile(jsModulePath)).toString('utf-8')
            var requireFromString = require('require-from-string')
            let fn = requireFromString(jsModule)

            if (typeof fn !== 'function') {
                console.log('SKIP (invalid config file)', pageName)
                return
            }

            let options = await fn(app)

            if (!options) {
                console.log('SKIP (invalid config file)', pageName)
                return
            }

            let formatType = options.format || 'html'

            options.source = `/pages/${pageName}/index.${formatType}`
            options.target = options.target || `/${pageName}`
            options.transform = async raw => {
                if (raw.indexOf(`USE_PUG`) !== -1) {
                    var fn = pug.compile(raw, {
                        basedir: require('path').join(projectCWD, 'src', `layouts`),
                        pretty: !argv.prod
                            // globals: Object.assign({}, process.env, argv)
                    })
                    raw = fn(options)
                }
                if (raw.indexOf(`USE_HANDLEBARS`) !== -1) {
                    options.page_name =
                        options.page_name ||
                        pageName
                        .split(`-`)
                        .join(` `)
                        .toUpperCase()
                    options = await language.translate(options, app)
                    raw = handlebars.compile(raw)(options)
                }

                return raw
            }
            return await buildFile(options)
        }

        async function buildSite() {
            const end = timeSpan()
            app.config = await require('./server/config').getConfig(app)
            app.config.distFolder = app.config.distFolder || `public_html`

            if(options.jest){
                return runServer()
            }

            await plugins.runPluginsWithPosition('beforeFullBuild', app)

            runServer()

            let pagesPath = require('path').join(projectCWD, 'src/pages')
            let pagesList = await sander.readdir(pagesPath)
            let pages = pagesList.map(async pageName => {
                return await buildPage(pageName)
            })
            await Promise.all(pages)

            await plugins.runPluginsWithPosition('afterFullBuild', app)

            console.log(`${now()} Full build took`, end.seconds().toFixed(3))
        }

        async function buildFile(options = {}) {
            let hasValidFormat = ['.md', '.html'].find(format => {
                return options.source.indexOf(format) != -1
            })
            if (!hasValidFormat) {
                options.source = options.source + `.html`
            }
            if (argv.test) {
                // console.log(`READ ${projectCWD}/src/${options.source}`)
            }
            let source = require('path').join(projectCWD, 'src', options.source)

            if (!(await sander.exists(source))) {
                console.log('SKIP (source not found)', options.source)
                return
            }

            var raw = (await sander.readFile(source)).toString('utf-8')

            var mdFormatHandler = async raw => {
                var marky = require('marky-markdown')
                return marky(raw)
            }

            let sourceFormatType = source.substr(source.lastIndexOf('.') + 1)
            if (sourceFormatType !== 'html') {
                options.formatTransformHandler = options.formatTransformHandler || {
                    md: mdFormatHandler
                }
                if (!options.formatTransformHandler[sourceFormatType]) {
                    raw = `FORMAT NOT SUPPORTED: ${sourceFormatType}`
                } else {
                    raw = await options.formatTransformHandler[sourceFormatType](raw)
                }
            }

            if (options.layout) {
                let layout = options.layout.split(`.html`).join(``) + `.html`
                let layoutPath = require('path').join(
                    projectCWD,
                    'src',
                    `layouts`,
                    `${layout}`
                )

                if (!(await sander.exists(layoutPath))) {
                    console.log(now(), `SKIP Invalid layout`, options.layout)
                } else {
                    layout = (await sander.readFile(layoutPath)).toString('utf-8')

                    let layoutConfig = layoutPath.split('.html').join('.js')

                    if (await sander.exists(layoutConfig)) {
                        layoutConfig = (await sander.readFile(layoutConfig)).toString(
                            'utf-8'
                        )
                        layoutConfig = requireFromString(layoutConfig)
                        layoutConfig = await layoutConfig(app, options)

                        if (layoutConfig.context) {
                            Object.assign(options, layoutConfig.context)
                        }
                    }

                    raw = layout.split(`%page_content%`).join(raw)

                    let partialsPath = require('path').join(projectCWD, 'src', `layouts`)
                    let partials = (await sander.readdir(partialsPath)).filter(
                        n => n.indexOf('_') === 0
                    )

                    if (partials) {
                        await Promise.all(
                            partials.map(name => {
                                return (async() => {
                                    let partialPath = require('path').join(
                                        projectCWD,
                                        'src/layouts',
                                        name
                                    )
                                    if (await sander.exists(partialPath)) {
                                        let partialRaw = (await sander.readFile(
                                            partialPath
                                        )).toString('utf-8')
                                        raw = raw.split(`%${name.split('.')[0]}%`).join(partialRaw)
                                    }
                                })()
                            })
                        )
                    }
                }
            }
            if (options.transform) {
                raw = options.transform(raw)
                if (raw instanceof Promise) {
                    raw = await raw
                }
            }
            if (argv.prod) {
                raw = minify(raw, {
                    removeAttributeQuotes: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    minifyCSS: true,
                    minifyJS: true,
                    removeComments: true,
                    removeScriptTypeAttributes: true,
                    useShortDoctype: true,
                    sortClassName: true,
                    sortAttributes: true
                })
                var HTMLUglify = require('html-uglify')
                var htmlUglify = new HTMLUglify({
                    salt: 'your-custom-salt',
                    whitelist: []
                })
                raw = htmlUglify.process(raw)
            }
            options.target = options.target.split('index.html').join('')
            options.target = require('path').join(options.target, `index.html`)
            if (argv.test) {
                console.log(`WILL WRITE ${options.target}`)
            } else {
                await sander.writeFile(
                    `${process.cwd()}/${app.config.distFolder}${options.target}`,
                    raw
                )
            }
        }
    })
}