'use strict';

var angular =     require('angular');
require('angular-route');
require('angular-animate');
require('angular-sanitize');

var MenuCtrl =    require('./controllers/menu');
var PageCtrl =    require('./controllers/page');

var assDemoControllers = angular.module('assDemoControllers', []);

var assDemoApp = angular.module('assDemo', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
  'assDemoControllers'
]);


assDemoControllers.controller('MenuCtrl', ['$scope', '$http', '$sce', MenuCtrl]);
assDemoControllers.controller('PageCtrl', ['$scope', '$routeParams', '$http', '$sce', PageCtrl]);


assDemoApp.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.
      when('/:page', {
        templateUrl: 'views/page.html',
        controller: 'PageCtrl'
      }).
      otherwise({
        redirectTo: '/synopsis'
      });
  }
]);