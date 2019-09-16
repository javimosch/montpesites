module.exports = Handlebars => {
    Handlebars.registerHelper('list', function(items, options) {
        var out = ''

        for (var i = 0, l = items.length; i < l; i++) {
            out = out + '' + options.fn(items[i]) + ''
        }

        return out + ''
    })
    Handlebars.registerHelper('each', function(context, options) {
        var ret = ''

        for (var i = 0, j = context.length; i < j; i++) {
            ret = ret + options.fn(context[i])
        }

        return ret
    })
}