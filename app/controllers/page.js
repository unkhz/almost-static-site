'use strict';

var PageCtrl = [
  'config', 'menu', '$scope', '$routeParams',
  function PageCtrl(config, menu, $scope, $routeParams) {
    $scope.data = {
      title:'',
      content:''
    };

    $scope.$on('activate:page', function(page, lastPage){
      $scope.data = menu.activePage.data;
      $scope.$emit("ass-page-data-applied")
    });
  }
];

module.exports = PageCtrl;