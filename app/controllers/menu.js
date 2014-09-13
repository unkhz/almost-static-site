'use strict';

module.exports = [
  'config', 'menu', '$scope',
  function MenuCtrl(config, menu, $scope) {

    function updateScope(){
      // Create an array of all subpage levels that should show menus
      var levels = [];
      if ( menu.activePage ) {
        menu.activePage.recurseParents(function(page){
          if ( !page.includesChildren && page.children && page.children.length ) {
            levels[page.level] = {
              id: page.level,
              pages: page.children
            };
          }
        });
      }
      $scope.subLevels = levels;
      $scope.pages = menu.rootPages;
    }

    $scope.template = 'views/menu.html';

    // Make sure that scope is updated on all menu updates
    menu.promises.isComplete.then(updateScope);
    $scope.$on('activate:page', updateScope);
  }
];