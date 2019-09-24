# Montpesites

Decentralized self-hosted platform to build, test and deploy static web sites.

## How it works

Each platform instance provides an interface to build, test and deploy a website.

A development version of the website being build will be available in each instance under a subdomain. Once the website is ready for production, the user needs to connect his gitlab account to push the changes to a repository. The production vesion of the website will be deployed using gitlab pages, a different free hosting service, or a custom ftp set by the user.

## Build with

- Caddy Reverse Proxy
- Cloudflare DNS
- Gitlab pages
- NodeJS
- MongoDB
- Docker
- Nodemon
- Love

## Roadmap

- 09-2019: Sketches
- 10-2019: Initial release
- 01-2020: Crowfounding campaign

## Documentation

This guidelines should allow you to use this tool without the GUI (If the GUI is is still WIP or is bugged)

## Website development

````js
yarn add -g montpesites
ms init
````

### Pages

- Stored under src/pages
- The name of the folder is the default public pathname
- Example: awesome-article
- Each folder has two files: a content file and a config file
- Content file default extension is html
- Example of content file: index.html
- Example of config file: index.js

````js
module.exports = async app => {
    return {
        //indicates a layout
        //src/layouts/app.html
        layout: 'app',
        //changes the public path
        target: '/'
    }
}
````

#### Content file format

Is also possible to write a content file in markdown, just change the extension of the file inside the page folder.

````md
src/awesome-article/index.md
````

### Partials

- Stored under src/layouts
- Named with underscore first
- Example: _header.html

### Template engines

- BUILT-IN Engine: Partials are part of the built-in template engine. Layouts and partials are used as follow.

    ````html
    <!-- layout file -->
    <body>
        <header>
            %_header%
        </header>
        %page_content%
        <footer>
            %_footer%
        </footer>
    <body>
    ````

    Note: %page_content% is the only special block and it renders the page content file.

- PUG: Add 'USE_PUG' at the beginnig of the content file of the page

    ````html
    <!-- USE_PUG -->
    ````

- HANDLEBARS: Same as PUG

    ````html
    <!-- USE_HANDLEBARS -->
    ````

### Sitemap generation

The client can generate a sitemap file (localhost only) after build completes.
Generator crawler with hit localhost at the targeted port (default 3000).

Add the plugin as follow:

````js
//ms.config.js
{
    plugins:{
        generateSitemap: {
            domain:'mydomain.com'
        }
    }
}
````

Start the server

```js
ms
//sitemap.xml should be generated after static generation.
```

## Platform development

The entire project has the follow structure:

````md
- src/pages
- src/layouts
- src/js/api
- src/js/components
- src/js/containers
- src/js/mixins
- src/js/store
- src/js/styles
- src/index
- src/server
- src/server/plugins
- server.js
- ms.config.js
````

Note: The GUI web app is an client side app rendered using the project itself. That's why there is a ms.config.js in the root directory.

### How to run

For development

````js
yarn dev
````

For production

````js
yarn start
````

### Plugins

The plugins section in ms.config.js can be populated with plugins.
Plugins are stored in /src/server/plugins

If you are interested in developing a plugin please create a separate repo and send a pull request.

#### List of plugins

- cleanDistFolders
- copyFolderContent
- generateSitemap
- webpackBundling

### Issues

Please feel free to add issues.

## Contributors

We are eager to find contributors for this project. If you want to help please email us.

## Donate

This tools is being developed for free by misitioba.com.
Any contribution is more than welcome.

### [MisitioBA on Liberapay](https://fr.liberapay.com/misitioba)
