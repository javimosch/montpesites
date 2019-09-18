var yargs = require('yargs')
let args = yargs
    .command('init', 'Creates a new project', function(yargs) {
        return yargs.option('here', {
            alias: 'here',
            describe: 'Indicates the current directory as target'
        })
    })
    .help().argv

let mainCommand = args['_'][0]

module.exports = {
    isEnabled() {
        return !!mainCommand
    },
    execute() {
        if (this[mainCommand]) {
            this[mainCommand]()
        } else {
            console.log(`Invalid command`, mainCommand)
            process.exit(1)
        }
    },
    async init() {
        renderHeader()
        createRepo()
        async function createRepo() {
            let inquirer = require('inquirer')
            let answers = await inquirer.prompt([{
                type: 'input',
                name: 'projectName',
                default: 'myawesomeproject',
                message: 'Project name :'
            }])
            const sander = require('sander')
            const path = require('path')
            let rootPath = path.join(process.cwd(), answers.projectName)
            if (await sander.exists(rootPath)) {
                console.log('Directory exists')
                return createRepo()
            }
            await sander.mkdir(rootPath)
            console.log(answers)
            sh = require('sh-exec')
            let repoUrl = `https://github.com/misitioba/montpesites-website-boilerplate.git`
            await sh `git clone ${repoUrl} ${answers.projectName}`
            require('colors')
            console.log(`Ready!`.green)
            console.log(`cd into ${answers.projectName} and read the README!`.green)
        }
    }
}

function renderHeader() {
    const chalk = require('chalk')
    const clear = require('clear')
    const figlet = require('figlet')
    clear()
    console.log(
        chalk.red(
            figlet.textSync('MONTPESITES', {}) // horizontalLayout: 'full'
        )
    )
}