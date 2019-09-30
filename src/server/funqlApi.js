module.exports = app => {
    const bodyParser = require('body-parser')
    app.use(
        bodyParser.json({
            limit: '5mb'
        })
    )
    const funql = require('funql-api')

    let sander = require('sander')
    let path = require('path')
    let fn = {}
    let funqlOptions = {
        api: {
            addPrivate(name, fnDef) {
                eval(`fn[name] = ${fnDef}`)
                return `${name} added`
            },
            addPublic(name, fnDef) {
                eval(`funqlOptions.api[name] = ${fnDef}`)
                return typeof funqlOptions.api[name]
            }
        }
    }

    app.funql = {
        extends: options => {
            if (options.api) {
                Object.keys(options.api).forEach(key => {
                    funqlOptions.api[key] = options.api[key]
                })
            }
        }
    }

    funql.middleware(app, funqlOptions)
}