const requireFromString = require('require-from-string')
const sander = require('sander')
module.exports = {
    async getLocales(app = {}) {
        let defaultBasePath = require('path').join(process.cwd(), 'src')
        let source = require('path').join(app.cwd || defaultBasePath, `locales.js`)
        var locales = (await sander.readFile(source)).toString('utf-8')
        locales = requireFromString(locales)
        locales = await locales(app)
        return locales
    },
    async translate(context = {}, app = {}) {
        let locales = await this.getLocales(app)
        if (app && app.config && app.config.refresh) {
            app.config.refresh()
        }
        let configDefaultLanguage =
            app.config && app.config.env && app.config.env.defaultLanguage
        let lang =
            context.lang ||
            configDefaultLanguage ||
            process.env.DEFAULT_LANGUAGE ||
            'en'
        for (var x in context) {
            if (typeof context[x] === 'string' && context[x].indexOf('I18N_') === 0) {
                context[x] =
                    locales[lang][context[x].split('I18N_').join('')] || context[x]
            }
        }
        context.locales = locales[lang]
        return context
    }
}