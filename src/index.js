#!/usr/bin/env node

const { now, moment, argv } = require('./server/commons')({
    dotenv: true
})

let pkg = require('sander').readFileSync(
    __dirname.substring(0, __dirname.lastIndexOf('/')),
    'package.json'
)
pkg = JSON.parse(pkg.toString('utf-8'))
console.log(now(), `Starting version `, pkg.version)

const cli = require('./server/cli')
if (cli.isEnabled()) {
    cli.execute()
} else {
    require('./server').startServer()
}