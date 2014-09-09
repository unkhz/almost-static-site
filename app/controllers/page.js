'use strict';

module.exports = [
  'config', 'menu', '$scope', '$routeParams',
  function PageCtrl(config, menu, $scope, $routeParams) {
    $scope.data = {
      title:'',
      content:''
    };

    $scope.$on('activate:page', function(page, lastPage){
      $scope.data = menu.activePage.data;
      $scope.children = menu.activePage.children;
      $scope.$emit("ass-page-data-applied")
    });
  }
];