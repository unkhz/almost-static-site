/*globals angular*/
'use strict';

module.exports = [
  'config', 'menu', '$scope',
  function TocCtrl(config, menu, $scope) {

    function updateScope() {
      $scope.children = menu.activePage.children &&
        menu.activePage.children.length ?
        menu.activePage.children : [];
    }

    angular.extend($scope, {
      template: 'features/toc.html',
      children:[]
    });

    // Make sure that toc is updated on all menu updates
    $scope.$on('activate:page', updateScope);
    menu.promises.isComplete.then(updateScope);
  }
];