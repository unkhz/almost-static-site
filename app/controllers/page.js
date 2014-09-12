'use strict';

module.exports = [
  'config', 'menu', '$scope', '$routeParams',
  function PageCtrl(config, menu, $scope, $routeParams) {
    $scope.data = {
      title:'',
      content:'',
      children:[]
    };

    $scope.$on('activate:page', function(page, lastPage){
      $scope.data.title = menu.activePage.title;
      $scope.data.content = menu.activePage.content;
      $scope.data.children = menu.activePage.children
        && menu.activePage.children.length
        && menu.activePage.includesChildren
        ? menu.activePage.children : [];
      $scope.$emit("ass-page-data-applied")
    });
  }
];