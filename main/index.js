'use strict';

var angular = require('angular');
require('angular-route');
require('angular-animate');
require('angular-sanitize');

var
  bootstrapData = window && window.ASS_BOOTSTRAP ? window.ASS_BOOTSTRAP : {},
  mainModule = angular.module('assMain', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize'
]);

mainModule
.constant('config', angular.extend(bootstrapData.runtimeConfig,{
  // Generate url for navigation link href
  href:function(suffix) {
    if ( suffix.match(/^([a-z]*:?\d*)\/\//) ) { return suffix; }
    var base =  this.enablePushState ? this.baseUrl : '#/';
    return  base + suffix.replace(/^\//,'');
  },
  url:function(suffix) {
    if ( suffix.match(/^([a-z]*:?\d*)\/\//) ) { return suffix; }
    return  this.baseUrl + suffix.replace(/^\//,'');
  }
}))

.run(['$templateCache', function($templateCache) {
  angular.forEach(bootstrapData.templates||{}, function(t,url) {
    $templateCache.put(url, t);
  });
}])

.factory('menu', require('./services/menu'))
.factory('features', require('./services/features'))

.run(['features', function(features) {
  features.register('content', require('../features/content'));
  features.register('filter', require('../features/filter'));
  features.register('includes', require('../features/includes'));
  features.register('submenu', require('../features/submenu'));
  features.register('toc', require('../features/toc'));
}])

.controller('ass.ctrl.menu', require('./controllers/menu'))
.controller('ass.ctrl.page', require('./controllers/page'))
.controller('ass.ctrl.header', require('./controllers/header'))
.controller('ass.ctrl.footer', require('./controllers/footer'))

.directive('assCompileHtml', require('./directives/compileHtml'))
.directive('assBroadcastLongPage', require('./directives/broadcastLongPage'))
.directive('assMoveAwayOnLongPage', require('./directives/moveAwayOnLongPage'))
.directive('assPageTransition', require('./directives/pageTransition'))

.config(
  ['$routeProvider', '$locationProvider', 'config',
  function($routeProvider, $locationProvider, config) {
    $locationProvider.html5Mode(config.enablePushState);
    $routeProvider
    .otherwise({
      templateUrl: 'main/views/page.html',
      controller: 'ass.ctrl.page'
    });
  }
])
.config(
  ['$logProvider', 'config',
  function($logProvider, config){
    $logProvider.debugEnabled(true, !!config.debug);
  }
])
;

module.exports = mainModule;