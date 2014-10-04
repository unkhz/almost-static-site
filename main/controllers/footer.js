/*globals angular*/
'use strict';

module.exports = [
  'config', 'menu', '$scope',
  function FooterCtrl(config, menu, $scope) {
    function updateScope(){
      angular.extend($scope, menu.pagesById.footer);
      if ( menu.activePage ) {
        $scope.styles = menu.activePage.stylesClassName;
      }
    }

    $scope.template = 'main/views/menu.html';
    $scope.styles = '';

    // Make sure that scope is updated on all menu updates
    menu.promises.isComplete.then(updateScope);
    menu.promises.isReady.then(updateScope);
    $scope.$on('activate:page', updateScope);
  }
];