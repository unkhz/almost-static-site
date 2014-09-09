'use strict';

module.exports = [
  'config', 'menu', '$scope',
  function MenuCtrl(config, menu, $scope) {
    $scope.template = 'views/menu.html';
    $scope.$on('activate:page', function(e, page, lastPage){
      $scope.pages = menu.rootPages;
      console.log(page);
      var children = [];
      if ( page.children.length ) {
        children = page.children;
      } else if ( (page.rootPage||{}).children.length ) {
        children = page.rootPage.children;
      }
      $scope.subPages = children;
    });
  }
];