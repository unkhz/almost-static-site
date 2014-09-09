'use strict';

var angular = require('angular');
require('angular-route');
require('angular-animate');
require('angular-sanitize');

var
  bootstrapData = window && window.ASS_BOOTSTRAP ? window.ASS_BOOTSTRAP : {},
  app = angular.module('assDemoApp', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize'
]);

app
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

.run(function($templateCache) {
  angular.forEach(bootstrapData.templates||{}, function(t,url) {
    $templateCache.put(url, t);
  });
})

.factory('menu', require('./services/menu'))

.controller('MenuCtrl', require('./controllers/menu'))
.controller('PageCtrl', require('./controllers/page'))
.controller('FooterCtrl', require('./controllers/footer'))

.directive('assBroadcastLongPage', require('./directives/broadcastLongPage'))
.directive('assMoveAwayOnLongPage', require('./directives/moveAwayOnLongPage'))
.directive('assPageTransition', require('./directives/pageTransition'))

.config(function($routeProvider, $locationProvider, config) {
  $locationProvider.html5Mode(config.enablePushState);
  $routeProvider
  .when(config.url(':pageId/:subPageId').replace(/^\/?/, '/'), {
    templateUrl: 'views/page.html',
    controller: 'PageCtrl'
  })
  .when(config.url(':pageId').replace(/^\/?/, '/'), {
    templateUrl: 'views/page.html',
    controller: 'PageCtrl'
  })
  .otherwise({
    templateUrl: 'views/page.html',
    controller: 'PageCtrl'
  });
})

;