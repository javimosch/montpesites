module.exports = async(app, pluginOptions, debug) => {
    return [{
            position: 'afterFullBuild',
            execute: getExecute(app, pluginOptions, debug)
        },
        {
            position: 'generateSitemap',
            execute: getExecute(app, pluginOptions, debug)
        }
    ]
}

function getExecute(app, pluginOptions, debug) {
    return function execute(params = {}, pluginOptions = {}) {
        return new Promise((resolve, reject) => {
            let config = app.config
            if (config.env.NODE_ENV === 'production') {
                resolve('Disabled in production')
            }
            const SitemapGenerator = require('sitemap-generator')

            const PORT = config.env.PORT || process.env.PORT || 3000
            const generator = SitemapGenerator(`http://localhost:${PORT}`, {
                stripQuerystring: false
                    // maxDepth:10
            })
            generator.on('done', () => {
                var j = require('path').join
                let raw = require('sander')
                    .readFileSync(j(process.cwd(), 'sitemap.xml'))
                    .toString('utf-8')
                let domain =
                    pluginOptions.domain ||
                    config.argv.domain ||
                    config.env.domain ||
                    `https://YOUR_DOMAIN`
                if (domain.indexOf(`YOUR_DOMAIN`) !== -1) {
                    debug(
                        `sitemap`,
                        `set the domain using pluginOptions.domain or --domain mydomain.com or env.domain in ms.config.js`
                        .yellow
                    )
                }
                domain = domain.split('https://').join('')
                domain = domain.split('http://').join('')
                domain = `https://${domain}`
                raw = raw.split(`http://localhost:${PORT}`).join(domain)
                require('sander').writeFileSync(j(process.cwd(), 'sitemap.xml'), raw)
                debug(`sitemap created`.green)
                var jsome = require('jsome')
                jsome({
                    crawled: `http://localhost:${PORT}`,
                    output: j(process.cwd(), 'sitemap.xml')
                })
            })
            generator.start()
        })
    }
}