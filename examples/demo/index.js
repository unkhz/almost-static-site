/*global angular*/
'use strict';

require('angular');

// Require the almost-static-site main module
var mainModule = require('../../main');

// Define the Demo App
var app = window.app = angular.module('demoApp', [
  'assMain'
]);

// Here you can define app specific angular extensions to the almost-static-site main module

module.exports = app;