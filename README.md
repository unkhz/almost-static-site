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

## Structure

    app             Sources
      api           YAML and Markdown source files
      css           SASS source files
      controllers   Angular controller source files
      views         Angular view source files
    config          Target configuration files
    dist            Generated files go here when Gulp build is run
