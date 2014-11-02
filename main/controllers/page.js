/*globals angular, ga*/
'use strict';

module.exports = [
  'config', 'menu', 'features', '$scope', '$rootScope',
  function PageCtrl(config, menu, features, $scope, $rootScope) {
    var _ = require('lodash');
    function updateScope() {
      if ( menu.activePage ) {
        var page = menu.activePage;
        $scope.features = _.filter(page.features, function(f){
          return f.targetComponentId === 'page';
        });
        $scope.styles = page.stylesClassName;
        $rootScope.bodyStyles = page.stylesClassName;
      }
      $scope.$emit('ass-page-data-applied');
    }
    function updateAnalytics() {
      if ( ga ) {
        ga('send', 'pageview', {
          'page': location.href,
            'title': menu.activePage.title
        });
      }
    }

    angular.extend($scope, {
      level:0,
      features: [],
      title:'',
      content:'',
      children:[],
      styles: []
    });

    // Make sure that toc is updated on all menu updates
    $scope.$on('activate:page', updateScope);
    $scope.$on('activate:page', updateAnalytics);
    menu.promises.isComplete.then(updateScope);
  }
];