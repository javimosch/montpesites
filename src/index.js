#!/usr/bin/env node

console.log('TRACE', {
    __dirname: __dirname,
    cwd: process.cwd()
})
const { now, moment, argv } = require('./server/commons')({
    dotenv: true
})
const cli = require('./server/cli')
if (cli.isEnabled()) {
    cli.execute()
} else {
    require('./server').startServer()
}