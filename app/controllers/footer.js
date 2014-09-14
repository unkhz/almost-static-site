'use strict';

module.exports = [
  'config', 'menu', '$scope',
  function FooterCtrl(config, menu, $scope) {
    function updateScope(){
      angular.extend($scope, menu.pagesById.footer);
    }

    $scope.template = 'views/menu.html';

    // Make sure that scope is updated on all menu updates
    menu.promises.isComplete.then(updateScope);
    menu.promises.isReady.then(updateScope);
  }
];