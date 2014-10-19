# Almost Static Site

Almost Static Site is my boilerplate for creating quick and dirty (M)EAN sites that use static YAML/Markdown files instead of MongoDB as a database. Gulp build converts the YAML files into JSON that are served with Express for the web application. Foundation (SCSS version) is used as the UI framework.

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

## Usage

    npm install -g gulp
    npm install

Build and server are run with default gulp task. Only thing you have to define is the site configuration (and data) to be used for the build. That is done with --site option.

    gulp --site example/demo

The server port is configured in the configuration file of the specified site e.g. example/demo/config.js.

    open http://localhost:5000/

You may want to use another configuration. The site configuration defaults to config.js inside the site folder. If a file is specified instead of the folder, it will be used as the configuration module.

    gulp --site example/demo/config-production.js


## Folder structure

    main            Sources for ASS Main module
    dist            Output directory for generated files and the server root folder
    examples        Sources for demo app modules, e.g. examples/demo

## Modules

### Main module

Main module takes care of building the page frame and menus.

#### Main module folder structure

    main            Sources
      index.html    Template file for building index.html
      index.js      JavaScript file that defines the main angular module
      css           SASS source files
      controllers   Angular controller source files
      directives    Angular directive source files
      services      Angular service source files
      views         Angular view source files
    dist            Generated files go here when Gulp build is run

#### Main module DOM Structure

    index.html      Main SPA HTML file. Content template is defined in
                    app/index.html, data in config/*.json.
      #app          App container, data is defined in api/app.md
        #header     Header, data and content is defined in api/header.md
        #menu       Navigation menus, content is automatically built based
                    on the pages in database.
        #content    Page content container, page specific data is defined in
                    api/pages/**/*.md. Content templates can vary depending
                    on page.
        #footer     Footer, data and content is defined in api/footer.md

### Feature modules

TBD

## Page configuration

Pages are configurable.

### Page Parameters

Each YAML and Markdown file inside the db directory defines one page in the site. The following configuration parameters can be used:

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


### Page Features

Page Feature    | Description
--------------- | ------------
content         | Display page content in the content area, enabled by default
toc             | Display table of contents on top of the content area
submenu         | Display child pages of this page in a submenu below the main menu
includes        | Include child pages in the content area below this page (with anchors)
filter          | Like includes, but with tag cloud filter selection menu
filter.params   | Params array defines the parameters to create tag cloud filters for


