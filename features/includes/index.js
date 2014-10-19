'use strict';

var angular = require('angular');
var _ = require('lodash');

var deps = ['config', 'menu', '$scope', '$rootScope'];
function IncludesCtrl(config, menu, $scope, $rootScope) {

  var allIncludes = [];
  function updateScope() {
    // If this is a subpage, we use the page defined in parent scope
    // Otherwise we use the active page
    var isSubpage = !!$scope.$parent.page;
    var page = $scope.$parent.page || menu.activePage;
    if ( page ) {
      page.recurseChildren(function(child){
        if ( child.id !== page.id ) {
          allIncludes.push(child);
        }
      });
    }
    allIncludes.sort(function(a,b){
      return a.ord < b.ord ? -1 : 1;
    });
    $scope.includes = _.first(allIncludes, isSubpage ? Infinity : 1);
  }

  // When user scrolls or view updates, we check if we need to add more content to the page
  function updateLimit() {
    var newValue = $rootScope.assBroadcastScrollPosition;
    if ( newValue >= 0 && $scope.includes.length < allIncludes.length ) {
      // Limit
      $scope.includes = _.first(allIncludes, $scope.includes.length + 1);
      $scope.isNotFullyDisplayed = $scope.includes.length < allIncludes.length;
    }
  }
  $rootScope.$watch('assBroadcastScrollPosition', updateLimit);

  $scope.template = 'features/includes/includes.html';
  $scope.includes = [];

  // Make sure that toc is updated on all menu updates
  $scope.$on('activate:page', updateScope);
  menu.promises.isComplete.then(updateScope);
}
module.exports = deps.concat(IncludesCtrl);