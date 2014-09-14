'use strict';

module.exports = [
  'config', 'menu', '$scope',
  function HeaderCtrl(config, menu, $scope) {
    function updateScope(){
      angular.extend($scope, menu.pagesById.header);
    }

    // Make sure that scope is updated on all menu updates
    menu.promises.isComplete.then(updateScope);
    menu.promises.isReady.then(updateScope);
  }
];