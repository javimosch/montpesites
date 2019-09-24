require('regenerator-runtime/runtime')

test('Extending funql-api', done => {
    let express = require('express')
    let app = express()
    require('../server')
        .start(app, {
            jest: true
        })
        .then(({ server }) => {
            app.funql.extends({
                api: {
                    bar() {
                        return 'BAR!'
                    }
                }
            })
            require('axios')
                .post('http://localhost:3000/funql-api', {
                    name: 'bar'
                })
                .then(r => {
                    expect(r.data).toBe('BAR!')
                    server.close()
                    done()
                })
        })
})