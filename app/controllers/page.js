'use strict';

module.exports = [
  'config', 'menu', '$scope', '$rootScope', '$routeParams',
  function PageCtrl(config, menu, $scope, $rootScope, $routeParams) {
    $scope.tocTemplate = 'views/page-toc.html';
    $scope.includeTemplate = 'views/page-include.html';
    angular.extend($scope, {
      title:'',
      content:'',
      children:[]
    });

    $scope.$on('activate:page', function(page, lastPage){
      $scope.title = menu.activePage.title;
      $scope.content = menu.activePage.content;
      $scope.children = menu.activePage.children
        && menu.activePage.children.length
        && menu.activePage.includesChildren
        ? menu.activePage.children : [];
      $scope.$emit("ass-page-data-applied")
    });
  }
];