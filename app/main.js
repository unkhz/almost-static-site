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


.config(function($routeProvider, $locationProvider) {
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
})

.run(function($rootScope){
  // TODO Refactor
  $rootScope.routeData = {
    newPageId:0,
    oldPageId:0,
    getContentTransitionDirection: function() {
      return this.newPageId > this.oldPageId ? 'ltr' : 'rtl';
    }
  };
});