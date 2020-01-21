var debug = require('debug')(
        `${'app:functions'.padEnd(15, ' ')} ${`${Date.now()}`.white}`
)

module.exports = app => {
  app.loadFunctions = createLoadFunctions(app)
  app.loadFunctions({
    path: __dirname
  })
}

function createLoadFunctions (app) {
  return function loadFunctions (options) {
    var folderPath = options.path || __dirname
    // debug(`Lets load functions from ${folderPath}`)
    var sander = require('sander')
    let files = sander.readdirSync(folderPath)
    files = files
      .filter(f => f !== 'index.js')
      .filter(f => {
        return f.indexOf('.js') !== -1
      })
    var self = {}
    files.forEach(f => {
      self[f.split('.')[0]] = require(folderPath + '/' + f)
    })
    let count = 0
    Object.keys(self)
      .map((k, index) => {
        var mod = self[k]
        return {
          name: k,
          handler: mod.handler ? mod.handler : mod
        }
      })
      .filter(fn => {
        if (typeof fn.handler !== 'function') {
          debug('Function file', fn.name, 'INVALID. Skipping...')
        }
        return typeof fn.handler === 'function'
      })
      .forEach(fn => {
        count++
        let impl = fn.handler(app)
        if (impl instanceof Promise) {
          impl
            .then(handler => onReady(app, fn, handler, options))
            .catch(onError)
        } else {
          onReady(app, fn, impl, options)
        }
      })
    debug(
      `${count} functions loaded from ${folderPath
        .split(process.cwd())
        .join('')}`
    )
  }
}

function onReady (app, fn, impl, options = {}) {
  if (typeof app[fn.name] !== 'undefined') {
    debug('Function file', fn.name, 'exists. Skipping...')
  } else {
    app.functions = app.functions || []
    app.functions.push(fn.name)
    // debug(fn.name.padEnd(30, ' '), `mounted to app.${fn.name}`)
    app[fn.name] = function () {
      var mergedScope = Object.assign({}, this, options.scope || {})
      let r = impl.apply(mergedScope, arguments)
      if (r instanceof Promise) {
        return new Promise(async (resolve, reject) => {
          try {
            r = await r
            /*
        debug(
          'call',
          fn.name,
          r instanceof Array
            ? 'Responded with ' + r.length + ' items'
            : `Responded with object ${printKeys(r)}`
        ) */
            resolve(r)
          } catch (err) {
            debug('call', fn.name, `Responded with error`, `${err.stack}`.red)
            reject(err)
          }
        })
      } else {
        /*
    debug(
      'call',
      fn.name,
      r instanceof Array
        ? 'Responded with ' + r.length + ' items'
        : `Responded with object ${printKeys(r)}`
    ) */
        return r
      }
    }
  }
}

function onError (err) {
  console.error('ERROR (Function)', err.stack || err)
  process.exit(1)
}

function printKeys (object = {}) {
  if (!object) {
    return object
  }
  let keys = Object.keys(object)
  if (keys.length > 10) {
    let count = keys.length
    keys = keys.filter((k, index) => index < 10)
    return `{${keys.join(', ')}... (${count} more)}`
  } else {
    return `{${keys.join(', ')}}`
  }
}