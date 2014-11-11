# Almost Static Site

Almost Static Site is a static site generator for quick and dirty (M)EAN sites that use static YAML/Markdown files instead of MongoDB as a database. Gulp build converts the YAML files into JSON that are served with Express for the web application. Foundation (SCSS version) is used as the UI framework.

## Main Ingredients

  * Node
  * Express
  * Gulp
  * Browserify
  * Angular
  * Foundation
  * SASS
  * YAML
  * Markdown w/ front matter YAML
  * LiveReload

## Demo

[almost-static-site.khz.fi](http://almost-static-site.khz.fi)

## Usage

```bash
npm install -g gulp
npm install
```

Build and server are run with default gulp task. Only thing you have to define is the site configuration (and data) to be used for the build. That is done with --site option.

```bash
gulp --site example/demo
```

The server port is configured in the configuration file of the specified site e.g. example/demo/config.js.

```bash
open http://localhost:5000/
```

You may want to use another configuration. The site configuration defaults to config.js inside the site folder. If a file is specified instead of the folder, it will be used as the configuration module.

```bash
gulp --site example/demo/config-production.js
```

## Folder structure

```
    main            Sources for ASS Main module
    dist            Output directory for generated files and the server root folder
    examples        Sources for demo app modules, e.g. examples/demo
```
## Modules

### Main module

Main module takes care of building the page frame and menus.

#### Main module folder structure

```
    main            Sources
      index.html    Template file for building index.html
      index.js      JavaScript file that defines the main angular module
      css           SASS source files
      controllers   Angular controller source files
      directives    Angular directive source files
      services      Angular service source files
      views         Angular view source files
    dist            Generated files go here when Gulp build is run
```

#### Main module DOM Structure

```
    index.html      Main SPA HTML file. Head content is defined in the
                    site module configuration file.
      #app          App container
        #header     Contains _site specific content_
        #menu       Navigation menus are automatically built based
                    on the _site spacific pages_.
        #content    Contains _site specific pages_
        #footer     Contains _site specific content_
```

### Site module

Site module is the module that will be written by you, the developer. You can freely decide the folder structure, but the DOM structure is locked except for the specific content areas that will be filled with site data. The visual style of the whole structure can be completely overridden in site module CSS.

All site module content is defined as individual pages. Header is a page, footer is a page and all of the includes in the exampl/demo are pages. Each YAML and Markdown file inside the site module's pages path (configurable) defines one of these pages. The following configuration parameters can be used.

Page Parameter  | Description
--------------- | ------------
id              | The slug that is used in the url and as a general reference to this page
parentId        | This page will be a child of the defined page
title           | Display name of the page
isFrontPage     | If true, this page will be the front page i.e. displayed when path is empty
isNotDisplayedInMenu | If true, this page will not be available in main menu or submenus
ord             | Numeric order priority of the page, smaller number means higher priority
features        | Features array contains all the enabled features for the current page
content         | Main content of the page, only relevant in YAML files, Markdown files define content outside front matter definition block.
styles          | Styles array contains dynamic styles that are defined in separate SASS files. The default place for those files is api/styles/*.scss.
bastards        | Bastards array contains extra pages that are added as child pages of this page without modifying their real parentId. This allows linking a page to a multiple container pages.
contentFromFile | Load content from a separate file


### Feature modules

All specific functionality, apart from the main DOM structure and menus is isolated into feature modules. The generator contains are a few basic features, but the idea is that modules filling a site specific purpose can and should be written and used locally.

Feature         | Description
--------------- | ------------
content         | Display page content in the content area, enabled by default
toc             | Display table of contents on top of the content area
submenu         | Display child pages of this page in a submenu below the main menu
subpages        | Include child pages with their own set of features
includes        | Include the contents of child pages in the content area below this page (with anchors)
filter          | Like includes, but with tag cloud filter selection menu
filter.params   | Params array defines the parameters to create tag cloud filters for
*.initialLimit  | Initial limit of includes, after which new includes are added based on scroll position
