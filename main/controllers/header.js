/*globals angular*/
'use strict';

module.exports = [
  'config', 'menu', '$scope',
  function HeaderCtrl(config, menu, $scope) {
    function updateScope(){
      angular.extend($scope, menu.pagesById.header);
      if ( menu.activePage ) {
        $scope.styles = menu.activePage.stylesClassName;
      }
    }
    $scope.styles = '';

    // Make sure that scope is updated on all menu updates
    menu.promises.isComplete.then(updateScope);
    menu.promises.isReady.then(updateScope);
    $scope.$on('activate:page', updateScope);
  }
];