const sander = require('sander')

module.exports = app => {
    var express = require('express')
    var router = express.Router()

    router.get('/pages', async(req, res) => {
        var localRepo = createLocalRepository(app)
        let repo = require('atob')(req.query.repo)
        await localRepo.configure(repo)
        res.json(await localRepo.getPages())
    })
    router.get('/page', async(req, res) => {
        var localRepo = createLocalRepository(app)
        let repo = require('atob')(req.query.repo)
        await localRepo.configure(repo)
        res.json(await localRepo.getPage(req.query.page))
    })
    app.use('/api/editor', router)
}

function createLocalRepository(app) {
    const sh = require('sh-exec')
    const osenv = require('osenv')
    const path = require('path')
    var uniqid = require('uniqid')
    repo = {}
    return {
        async configure(repoUrl) {
            repo.url = repoUrl
            if (!repo.ready) {
                repo.id = uniqid()
                repo.base = path.join(osenv.tmpdir(), `repo_${repo.id}`)
                repo.root = path.join(repo.base, 'repo')
                if (!(await sander.exists(repo.base))) {
                    await sh `mkdir ${repo.base}`
                }
                if (!(await sander.exists(repo.root))) {
                    let clone = `cd ${repo.base}; git clone ${repo.url} repo`
                    await sh `${clone}`
                } else {}
                repo.ready = true
            }
        },
        async getPages() {
            if (!repo.ready) {
                throw new Error('REPO_NOT_READY')
            }
            let pages = path.join(repo.root, 'src/pages')
            pages = await sander.readdir(pages)
            return pages
        },
        async getPage(pageName) {
            if (!repo.ready) {
                throw new Error('REPO_NOT_READY')
            }
            let pageDir = path.join(repo.root, 'src/pages', pageName)

            if(!await sander.exists(pageDir)){
                return {
                    err:'NOT_FOUND'
                }
            }

            let pagesFiles = await sander.readdir(pageDir)
            let response = {
                contentFile: {
                    raw: ''
                }
            }
            await Promise.all(
                pagesFiles.map(fileName => {
                    return (async() => {})()
                })
            )
            return response
        }
    }
};
``