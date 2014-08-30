'use strict';

var MenuCtrl = [
  'config', 'menu', '$scope',
  function MenuCtrl(config, menu, $scope) {
    $scope.template = 'views/menu.html';
    $scope.$on('activate:page', function(page, lastPage){
      $scope.pages = menu.pages;
    });
  }
];

module.exports = MenuCtrl;