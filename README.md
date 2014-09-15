# Almost Static Site

Almost Static Site is my boilerplate for creating quick and dirty (M)EAN sites that use static YAML/Markdown files instead of MongoDB as a database. Gulp build converts the YAML files into JSON that are served with Express for the web application.

## Main Ingredients

  * Node
  * Express
  * Gulp
  * Browserify
  * Angular
  * YAML
  * Markdown w/ front matter YAML
  * SASS
  * LiveReload

## Usage

    npm install -g gulp
    npm install

Build and server are run with default gulp task.

    gulp

Target configuration defaults to 'dev', so the site is running on the port defined in config/dev.js.

    open http://localhost:5000/

You may want to use another configuration. The targets are defined as individual files inside config/.

    gulp --target=production

## Folder Structure

    app             Sources
      api           YAML and Markdown source files
      css           SASS source files
      controllers   Angular controller source files
      views         Angular view source files
    config          Target configuration files
    dist            Generated files go here when Gulp build is run

## Default DOM Structure

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

## Page Parameters

Each YAML and Markdown file inside the db directory defines one page in the site. The following configuration parameters can be used:

    id              The slug that is used in the url and as a general reference to this page
    parentId        This page will be a child of the defined page
    title           Display name of the page
    isFrontPage     If true, this page will be the front page i.e. displayed when path is empty
    isNotDisplayedInMenu If true, this page will not be available in main menu or submenus
    ord             Numeric order priority of the page, smaller number means higher priority
    features        Features array contains all the enabled features for the current page
    content         Main content of the page, only relevant in YAML files, Markdown files define content
                    outside front matter definition block.

## Page Features

    content         Display page content in the content area, enabled by default
    toc             Display table of contents on top of the content area
    submenu         Display child pages of this page in a submenu below the main menu
    includes        Include child pages in the content area below this page (with anchors)


