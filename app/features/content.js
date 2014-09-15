'use strict';

module.exports = [
  'config', 'menu', '$scope', '$rootScope', '$routeParams',
  function ContentCtrl(config, menu, $scope, $rootScope, $routeParams) {

    function updateScope() {
      $scope.title = menu.activePage.title;
      $scope.content = menu.activePage.content;
      $scope.$emit("ass-page-data-applied")
    }

    angular.extend($scope, {
      template:'features/content.html',
      title:'',
      content:''
    });

    // Make sure that toc is updated on all menu updates
    $scope.$on('activate:page', updateScope);
    menu.promises.isComplete.then(updateScope);
  }
];