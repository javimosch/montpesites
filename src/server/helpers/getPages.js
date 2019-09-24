module.exports = async function getPages(options = {}) {
    let app = this.app
    let sander = require('sander')
    const requireFromString = require('require-from-string')

    let pages = await sander.readdir(
        require('path').join(process.cwd(), 'src', 'pages')
    )
    pages = await Promise.all(
        pages
        .map(pageName => {
            return (async() => {
                let configPath = require('path').join(
                    process.cwd(),
                    'src',
                    'pages',
                    pageName,
                    'index.js'
                )
                if (!(await sander.exists(configPath))) {
                    return null
                }
                let config = requireFromString(
                    (await sander.readFile(configPath)).toString('utf-8')
                )
                config = await config(app)
                let data = {
                    href: config.target || `/${pageName}`,
                    title: config.title || pageName,
                    data: config
                }
                data = await app.translate(
                    Object.assign(data, {
                        lang: options.lang
                    })
                )
                return data
            })()
        })
        .filter(promise => promise != null)
    )
    return pages
}