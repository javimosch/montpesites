#!/usr/bin/env node

require('dotenv').config({
    silent: true
})
const projectCWD = process.cwd()
const argv = require('yargs').argv
const fs = require('fs')
const minify = require('html-minifier').minify
const sander = require('sander')
const pug = require('pug')
const handlebars = require('handlebars')
const requireFromString = require('require-from-string')
const moment = require('moment-timezone')

var now = () =>
    moment()
    .tz('Europe/Paris')
    .format('DD-MM-YY HH:mm:ss')
require('./server/handlebarsTemplates')(handlebars)

const language = require('./server/language')
let express = require('express')

const PORT = process.env.PORT || 3000
var app = express()
app.language = language
app.translate = ctx => app.language.translate(ctx, app)

let layoutParams = [`head_title`, `article_title`]

if (argv.sitemap) {
    const SitemapGenerator = require('sitemap-generator')

    // create generator
    const generator = SitemapGenerator(`http://localhost:${PORT}`, {
        stripQuerystring: false
    })
    generator.on('done', () => {
        console.log(`sitemap created`)
        process.exit(0)
    })

    // start the crawler
    generator.start()
}

if (argv.build || argv.watch) {
    buildSite()
}

if (argv.watch) {
    var chokidar = require('chokidar')
    chokidar
        .watch(projectCWD, {
            ignored: /(^|[\/\\])\../
        })
        .on('change', (path, stats) => {
            if (path.indexOf('/pages/') !== -1) {
                let pageName = path
                    .split(require('path').join(process.cwd(), `src`))
                    .join(``)
                pageName = pageName.split(`/pages/`).join(``)
                pageName = pageName.substring(0, pageName.indexOf('/'))
                console.log(`Compiling ${pageName}`)
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

            if (path.indexOf('public_html') === -1) {
                console.log(`No changes ${path}`)
            }
        })
}

if (argv.server) {
    var server = require('http').Server(app)

    server.listen(PORT)
    console.log(now(), `Server ready at`, PORT)
    app.use(
        '/',
        express.static(require('path').join(process.cwd(), 'public_html'))
    )
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
        console.log('SKIP', pageName)
        return
    }

    var jsModule = (await sander.readFile(jsModulePath)).toString('utf-8')
    var requireFromString = require('require-from-string')
    let fn = requireFromString(jsModule)
    let options = await fn(app)
    options.source = `/pages/${pageName}/index.html`
    options.target = options.target || `/${pageName}`
    options.transform = async html => {
        if (html.indexOf(`USE_PUG`) !== -1) {
            var fn = pug.compile(html, {
                basedir: require('path').join(projectCWD, 'src', `layouts`),
                pretty: !argv.prod
                    // globals: Object.assign({}, process.env, argv)
            })
            html = fn(layoutParams)
        }
        if (html.indexOf(`USE_HANDLEBARS`) !== -1) {
            options.page_name =
                options.page_name ||
                pageName
                .split(`-`)
                .join(` `)
                .toUpperCase()
            options = await language.translate(options, app)
            html = handlebars.compile(html)(options)
        }

        return html
    }
    return await buildFile(options)
}

async function buildSite() {
    app.config = await require('./server/config').getConfig(app)
    let pagesPath = require('path').join(projectCWD, 'src/pages')
    let pagesList = await sander.readdir(pagesPath)
    let pages = pagesList.map(async pageName => {
        return await buildPage(pageName)
    })
    await Promise.all(pages)

    console.log(`${now()} Site compiled`)
}

async function buildFile(options = {}) {
    options.source = options.source.split('.html').join('') + `.html`
    if (argv.test) {
        // console.log(`READ ${projectCWD}/src/${options.source}`)
    }
    let source = require('path').join(projectCWD, 'src', options.source)

    var html = (await sander.readFile(source)).toString('utf-8')
    if (options.layout) {
        let layout = options.layout.split(`.html`).join(``) + `.html`
        let layoutPath = require('path').join(
            projectCWD,
            'src',
            `layouts`,
            `${layout}`
        )
        layout = (await sander.readFile(layoutPath)).toString('utf-8')

        let layoutConfig = layoutPath.split('.html').join('.js')

        if (await sander.exists(layoutConfig)) {
            layoutConfig = (await sander.readFile(layoutConfig)).toString('utf-8')
            layoutConfig = requireFromString(layoutConfig)
            layoutConfig = await layoutConfig(app, options)

            if (layoutConfig.context) {
                Object.assign(options, layoutConfig.context)
            }
        }

        html = layout.split(`%page_content%`).join(html)

        if (app.config.layoutPartials) {
            await Promise.all(
                app.config.layoutPartials.map(name => {
                    return (async() => {
                        let partialPath = require('path').join(
                            projectCWD,
                            'src/layouts',
                            name
                        )
                        if (await sander.exists(partialPath)) {
                            let partialRaw = (await sander.readFile(partialPath)).toString(
                                'utf-8'
                            )
                            html = html.split(`%${name.split('.')[0]}%`).join(partialRaw)
                        }
                    })()
                })
            )
        }

        layoutParams.forEach(param => {
            if (options[param]) {
                html = html.split(`%${param}%`).join(options[param])
            }
        })
    }
    if (options.transform) {
        html = options.transform(html)
        if (html instanceof Promise) {
            html = await html
        }
    }
    if (argv.prod) {
        html = minify(html, {
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
        html = htmlUglify.process(html)
    }
    options.target = options.target.split('index.html').join('')
    options.target = require('path').join(options.target, `index.html`)
    if (argv.test) {
        console.log(`WILL WRITE ${options.target}`)
    } else {
        await sander.writeFile(
            `${process.cwd()}/public_html${options.target}`,
            html
        )
    }
}