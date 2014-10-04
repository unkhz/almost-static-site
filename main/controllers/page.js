/*globals angular*/
'use strict';

module.exports = [
  'config', 'menu', 'features', '$scope', '$rootScope',
  function PageCtrl(config, menu, features, $scope, $rootScope) {

    var _ = require('lodash');

    function updateScope() {
      if ( menu.activePage ) {
        $scope.features = _.filter(menu.activePage.features, function(f){
          return f.targetComponentId === 'page';
        });
        $scope.styles = menu.activePage.stylesClassName;
        $rootScope.bodyStyles = menu.activePage.styles ? 'ass-style-' + menu.activePage.styles.join(' ass-style-') : '';
      }
      $scope.$emit('ass-page-data-applied');
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
    menu.promises.isComplete.then(updateScope);
  }
];