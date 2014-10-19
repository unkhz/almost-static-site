/*globals angular*/
'use strict';

module.exports = [
  'config', 'menu', '$scope',
  function TocCtrl(config, menu, $scope) {

    function updateScope() {
      // If this is a subpage, we use the page defined in parent scope
      // Otherwise we use the active page
      var page = $scope.$parent.page || menu.activePage;
      if ( page ) {
        $scope.children = page.children &&
          page.children.length ?
          page.children : [];
      }
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