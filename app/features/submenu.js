'use strict';

module.exports = [
  'config', 'menu', '$scope',
  function SubmenuCtrl(config, menu, $scope) {

    function updateScope(){
    }

    $scope.template = 'features/submenu.html';

    // Make sure that scope is updated on all menu updates
    menu.promises.isComplete.then(updateScope);
    $scope.$on('activate:page', updateScope);
  }
];