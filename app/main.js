'use strict';

var angular = require('angular');
require('angular-route');
require('angular-animate');

var
  bootstrapData = window && window.ASS_BOOTSTRAP ? window.ASS_BOOTSTRAP : {},
  app = angular.module('assDemoApp', [
  'ngRoute',
  'ngAnimate'
]);

app
.constant('config', angular.extend(bootstrapData.runtimeConfig,{
  url:function(suffix) {
    return this.baseUrl.replace(/\/?$/,'/') + suffix.replace(/^\//,'');
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

.directive('assBroadcastLongPage', require('./directives/assBroadcastLongPage'))
.directive('assMoveAwayOnLongPage', require('./directives/assMoveAwayOnLongPage'))
.directive('assPageTransition', require('./directives/assPageTransition'))

.config(function($routeProvider, $locationProvider, config) {
  $locationProvider.html5Mode(true);
  $routeProvider
  .when(config.url(':pageId'), {
    templateUrl: 'views/page.html',
    controller: 'PageCtrl'
  })
  .otherwise({
    templateUrl: 'views/page.html',
    controller: 'PageCtrl'
  });
})

;