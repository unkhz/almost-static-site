'use strict';

var angular = require('angular');
var _ = require('lodash');
var TagCloud = require('./TagCloud');


var deps = ['config', 'menu', '$scope', '$rootScope'];
function FilterCtrl(config, menu, $scope, $rootScope) {

  var allIncludes = [],
      filteredIncludes = [];
  function updateScope() {
    $scope.tagCloudInstances = TagCloud.instances;
    $scope.selected = TagCloud.selectedTagNames;

    if ( menu.activePage ) {
      menu.activePage.recurseChildren(function(page){
        if ( page.id !== menu.activePage.id ) {
          allIncludes.push(page);
        }
      });
    }

    $scope.tagClouds = _.values(TagCloud.instances);

    // Order
    allIncludes.sort(function(a,b){
      return a.ord < b.ord ? -1 : 1;
    });
    filteredIncludes = allIncludes.concat();

    // Include only child page before transition
    $scope.includes = _.first(allIncludes,1);
  }

  // When user scrolls or view updates, we check if we need to add more content to the page
  function updateFilter(){
    // Filter
    filteredIncludes = TagCloud.selectedTagNames.length === 0 ?
      allIncludes :
      _.filter(allIncludes, function(page) {
        return _.every($scope.tagClouds, function(cloud){
          return cloud.selected.length === 0 || cloud.isLinkSelected(page);
        });
      });
    updateLimit();
  }

  function updateLimit() {
    var newValue = $rootScope.assBroadcastScrollPosition;
    if ( newValue >= 0 && $scope.includes.length < filteredIncludes.length ) {
      // Limit
      $scope.includes = _.first(filteredIncludes, $scope.includes.length + 1);
      $scope.isNotFullyDisplayed = $scope.includes.length < filteredIncludes.length;
    }
  }

  $rootScope.$watch('assBroadcastScrollPosition', updateLimit);
  $scope.$watch('selected', updateFilter);
  $scope.updateFilter = updateFilter;

  $scope.template = 'features/filter/filter.html';
  $scope.includes = [];

  // Make sure that toc is updated on all menu updates
  $scope.$on('activate:page', updateScope);
  menu.promises.isComplete.then(updateScope);
}

// Initialization method is run when the feature implementation is instantiated for a page
FilterCtrl.initialize = function(featureImpl){
  featureImpl.page.recurseChildren(function(childPage){
    angular.forEach(featureImpl.params, function(param){

      // Initialize tag cloud
      var cloud = TagCloud.getInstance(param);

      // Initialize params
      var tagNames = !childPage[param] ?
        [] : _.isArray(childPage[param]) ?
        childPage[param] : [childPage[param]];

      // Add tags and links to pages
      angular.forEach(tagNames, function(tagName){
        cloud.add(tagName, childPage);
      });

      // Sort by count
      cloud.tags.sort(function(a,b){
        return a.count > b.count ? -1 : a.count < b.count ? 1 : 0;
      });
    });
  });
};

module.exports = deps.concat(FilterCtrl);