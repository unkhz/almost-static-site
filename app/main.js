'use strict';

var angular = require('angular');
require('angular-route');
require('angular-animate');
require('angular-sanitize');

var assDemoCtrls = angular.module('assDemoCtrls', []);
var assDemoApp = angular.module('assDemoApp', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
  'assDemoCtrls'
]);


assDemoCtrls.controller('MenuCtrl', require('./controllers/menu'));
assDemoCtrls.controller('PageCtrl', require('./controllers/page'));
assDemoCtrls.controller('FooterCtrl', require('./controllers/footer'));


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

assDemoApp.directive('assBroadcastLongPage', function($rootScope, $window, $timeout) {
  return {
    restrict: 'A',
    link: function($scope, el, attrs) {
      $rootScope.isWaitingForPageHeight = true;
      $scope.$on('ass-page-data-applied', function(complete) {
        var h = el[0].offsetHeight,
            containerH = $window.outerHeight - document.getElementById('header').offsetHeight;
        $rootScope.isLongPage = h > containerH;
        $rootScope.isWaitingForPageHeight = false;
      });
    }
  };
});

assDemoApp.directive('assMoveAwayOnLongPage', function($rootScope, $window, $timeout) {
  return {
    restrict: 'A',
    link: function($scope, el, attrs) {
      $rootScope.$watch('isWaitingForPageHeight', function(newValue, oldValue) {
        if ( newValue && $rootScope.isLongPage ) {
          // footer is away from view, hide it as soon as possible to avoid flash
          el.addClass("is-invisible");
        }
      });
      $rootScope.$watch('isLongPage', function(newValue, oldValue) {
        if ( newValue ) {
          // slide out, when short page -> long page
          el.addClass("is-away");
          $timeout(function(){
            el.removeClass("is-away");
          },1000);
        } else if ( oldValue ) {
          // slide in, when long page -> short page
          el.addClass("is-invisible is-away");
          $timeout(function(){
            el.removeClass("is-invisible is-away");
          },200);
        }
      });
    }
  };
});