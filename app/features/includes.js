'use strict';

module.exports = [
  'config', 'menu', '$scope', '$rootScope', '$routeParams',
  function IncludeCtrl(config, menu, $scope, $rootScope, $routeParams) {

    function updateScope() {
      $scope.children = menu.activePage.children
        && menu.activePage.children.length
        ? menu.activePage.children : [];
      $scope.children.sort(function(a,b){ return a.ord > b.ord; });
    }

    angular.extend($scope, {
      template: 'features/includes.html',
      children:[]
    });

    // Make sure that toc is updated on all menu updates
    $scope.$on('activate:page', updateScope);
    menu.promises.isComplete.then(updateScope);
  }
];