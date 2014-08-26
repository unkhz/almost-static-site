'use strict';

var angular = require('angular');
require('angular-route');
require('angular-animate');
require('angular-sanitize');

var MenuCtrl =    require('./controllers/menu');
var PageCtrl =    require('./controllers/page');

var assDemoCtrls = angular.module('assDemoCtrls', []);

var assDemoApp = angular.module('assDemoApp', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
  'assDemoCtrls'
]);


assDemoCtrls.controller('MenuCtrl', MenuCtrl);
assDemoCtrls.controller('PageCtrl', PageCtrl);


assDemoApp.config(function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.
    when('/:page', {
      templateUrl: 'views/page.html',
      controller: 'PageCtrl'
    }).
    otherwise({
      // TODO Refactor, data specific
      redirectTo: '/synopsis'
    });
}).run(function($rootScope){
  // TODO Refactor
  $rootScope.routeData = {
    newPageId:0,
    oldPageId:0,
    getContentTransitionDirection: function() {
      return this.newPageId > this.oldPageId ? 'ltr' : 'rtl';
    }
  };
});