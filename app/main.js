'use strict';

var angular = require('angular');
require('angular-route');
require('angular-animate');
require('angular-sanitize');

angular.module('assDemoApp', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize'
])

.controller('MenuCtrl', require('./controllers/menu'))
.controller('PageCtrl', require('./controllers/page'))
.controller('FooterCtrl', require('./controllers/footer'))

.directive('assBroadcastLongPage', require('./directives/assBroadcastLongPage'))
.directive('assMoveAwayOnLongPage', require('./directives/assMoveAwayOnLongPage'))
.directive('assPageTransition', require('./directives/assPageTransition'))


.config(function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider
  .when('/:pageId', {
    templateUrl: 'views/page.html',
    controller: 'PageCtrl'
  })
  .otherwise({
    templateUrl: 'views/page.html',
    controller: 'PageCtrl'
  });
});