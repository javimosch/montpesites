const requireFromString = require('require-from-string')
const sander = require('sander')

const moment = require('moment-timezone')
var now = () =>
    moment()
    .tz('Europe/Paris')
    .format('DD-MM-YY HH:mm:ss')

module.exports = {
    async getLocales(app = {}) {
        let defaultBasePath = require('path').join(process.cwd(), 'src')
        let source = require('path').join(app.cwd || defaultBasePath, `locales.js`)
        if (!(await sander.exists(source))) {
            console.log(now(), 'WARN', 'src/locales.js missing (i18N disabled)')
            return {}
        }
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

        function translateObject(object) {
            Object.keys(object).forEach(key => {
                if (typeof key === 'string') {
                    if (object[key].indexOf && object[key].indexOf('I18N_') === 0) {
                        object[key] =
                            locales[lang][object[key].split('I18N_').join('')] || object[key]
                    }
                }
                if (
                    typeof object[x] === 'object' &&
                    Object.keys(object[key]).length > 0
                ) {
                    translateObject(object[x])
                }
            })
        }

        for (var x in context) {
            if (typeof context[x] === 'string' && context[x].indexOf('I18N_') === 0) {
                context[x] =
                    locales[lang][context[x].split('I18N_').join('')] || context[x]
            } else {
                if (typeof context[x] === 'object') {
                    translateObject(context[x])
                }
            }
        }
        context.locales = context.lng = context.lang = context.i18n = locales[lang]
        return context
    }
}