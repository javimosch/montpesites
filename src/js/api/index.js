import axios from 'axios'
export default function funql(name, args, transform, options = {}) {
    if (typeof transform === 'object') {
        options = transform
        transform = undefined
    }

    return new Promise((resolve, reject) => {
        axios
            .post(`/funql-api?name=${name}&ns=${options.namespace || 'none'}`, {
                name,
                args,
                transform: transform && transform.toString(),
                ...options
            })
            .then(function(response) {
                console.log('axios', name, 'then', response.data)
                resolve(response.data)
            })
            .catch(function(error) {
                console.error('axios', name, 'catch', error)
                reject(error)
            })
    })
}
export async function prepareApi() {
    let api = {
        funql
    }
    await api.funql('addPrivate', [
        'getProjectsConfigPath',
        `async  function() {
          let configPath = path.join(process.env.MS_DATA, "projects.json")
          if(!await sander.exists(configPath)){
            await sander.writeFile(configPath,JSON.stringify({}))
          }
          return configPath
        }`
    ])
    await api.funql('addPrivate', [
        'getProjectsConfig',
        `async  function(name) {
          let configPath = await fn.getProjectsConfigPath()
          return JSON.parse(await sander.readFile(configPath,{
            encoding:'utf-8'
          }))
        }`
    ])
    await api.funql('addPrivate', [
        'setProjectsConfig',
        `async  function(data) {
          let configPath = await fn.getProjectsConfigPath()
          return sander.writeFile(configPath,JSON.stringify(data,null,4));
        }`
    ])
    await api.funql('addPublic', [
        'getProjectConfig',
        `async  function(name) {
          let config = await fn.getProjectsConfig()
          if(!config[name]){
              config[name] = {
                  repoUrl:"",
                  name
              }
              await fn.setProjectsConfig(config)
          }
          return config[name];
        }`
    ])
    await api.funql('addPublic', [
        'getAvailableProjects',
        `async  function(name) {
          let config = await fn.getProjectsConfig()
          return Object.keys(config).map(n=>({name:n}))
        }`
    ])
}