require('regenerator-runtime/runtime')

test('Calling getPages', done => {
    let express = require('express')
    let app = express()
    require('../server')
        .start(app, {
            jest: true,
            server: false
        })
        .then(async({ server }) => {
            let pages = await app.helpers.getPages()
            expect(pages instanceof Array).toBe(true)
            done()
        })
})