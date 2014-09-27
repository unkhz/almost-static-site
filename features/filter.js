/*globals angular*/
'use strict';

module.exports = [
  'config', 'menu', '$scope', '$rootScope', '$routeParams', '$location',
  function IncludeCtrl(config, menu, $scope, $rootScope, $routeParams, $location) {

    var _ = require('lodash');

    function Tag(name) {
      this.name = name;
      this.count = 1;
    }

    // Cloud multiton
    function TagCloud(name) {
      this.name = name;
      this.tagsById = {};
      this.selected = [];
      _.bindAll(this, 'filterSelected', 'filterUnselected');
    }

    TagCloud.prototype.tags = function(){
      return _.values(this.tagsById);
    };
    TagCloud.prototype.add = function(name){
      if ( !this.tagsById[name] ) {
        this.tagsById[name] = new Tag(name);
      } else {
        this.tagsById[name].count++;
      }
    };
    TagCloud.prototype.select = function(tag){
      this.selected = _.union(this.selected, [tag]);
      TagCloud.selectedTagNames = _.union(TagCloud.selectedTagNames, [tag.name]);
    };
    TagCloud.prototype.unselect = function(tag){
      this.selected = _.without(this.selected, tag);
      TagCloud.selectedTagNames = _.without(TagCloud.selectedTagNames, tag.name);
    };
    TagCloud.prototype.filterUnselected = function(tag){
      return _.contains(this.selected, tag);
    };
    TagCloud.prototype.filterSelected = function(tag){
      return !_.contains(this.selected, tag);
    };
    TagCloud.instances = [];
    TagCloud.selectedTagNames = [];
    TagCloud.getInstance = function(name) {
      if ( !TagCloud.instances[name] ) {
        TagCloud.instances[name] = new TagCloud(name);
      }
      return TagCloud.instances[name];
    };

    function updateScope() {
      var feature = $scope.feature,
          search = $location.search()||{},
          selected = search.name ? search.name.split(',') : [];

      if ( menu.activePage ) {
        menu.activePage.recurseChildren(function(page){
          angular.forEach(feature.params, function(param){
            var cloud = TagCloud.getInstance(param),
                params = !page[param] ? [] : _.isArray(page[param]) ? page[param] : [page[param]];
            angular.forEach(params, function(name){
              cloud.add(name);
            });
          });
        });
      }

      $scope.tagClouds = _.values(TagCloud.instances);
      $scope.orderSkillBy = '-count';

      var includes = [];
      if ( menu.activePage && !$scope.includes ) {
        menu.activePage.recurseChildren(function(page){
          if ( page.id !== menu.activePage.id ) {
            includes.push(page);
          }
        });
      }
      $scope.includes = includes;
      $scope.selected = selected;
      $scope.filterSkillBySelected = function(skill) {
        return _.contains($scope.selected, skill.name);
      };
      $scope.filterPageBySelectedTags = function(page) {
        return TagCloud.selectedTagNames.length === 0 || _.every($scope.tagClouds, function(cloud){
          var pageTags = !page[cloud.name] ? [] : _.isArray(page[cloud.name]) ? page[cloud.name] : [page[cloud.name]];
          return _.intersection(pageTags, _.pluck(cloud.selected, 'name')).length === cloud.selected.length;
        });
      };
      $scope.orderPageBy = '-startDate';
    }

    angular.extend($scope, {
      template: 'features/filter.html',
      children:[]
    });

    // Make sure that toc is updated on all menu updates
    $scope.$on('activate:page', updateScope);
    menu.promises.isComplete.then(updateScope);
  }
];