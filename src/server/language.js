const requireFromString = require('require-from-string')
const sander = require('sander')
module.exports = {
    async getLocales(options = {}) {
        let defaultBasePath = require('path').join(process.cwd(), 'src')
        let source = require('path').join(
            options.cwd || defaultBasePath,
            `locales.js`
        )
        var locales = (await sander.readFile(source)).toString('utf-8')
        locales = requireFromString(locales)
        locales = await locales(options)
        return locales
    },
    async translate(context = {}, options = {}) {
        let locales = await this.getLocales(options)
        let lang = context.lang || process.env.DEFAULT_LANGUAGE || 'en'
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