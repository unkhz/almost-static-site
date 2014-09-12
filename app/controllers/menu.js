'use strict';

module.exports = [
  'config', 'menu', '$scope',
  function MenuCtrl(config, menu, $scope) {
    $scope.template = 'views/menu.html';
    $scope.$on('activate:page', function(e, page, lastPage){
      $scope.pages = menu.rootPages;
      var children = [];
      if ( page.includesChildren ) {
        // included children have their own menu
      } else if ( page.children && page.children.length ) {
        children = page.children;
      } else if ( page.rootPage && page.rootPage.children && page.rootPage.children.length ) {
        children = page.rootPage.children;
      }
      $scope.subPages = children;
    });
  }
];