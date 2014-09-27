/*globals angular*/
'use strict';

module.exports = [
  'config', 'menu', '$scope', '$rootScope', '$routeParams', '$sce',
  function ContentCtrl(config, menu, $scope, $rootScope, $routeParams, $sce) {

    function updateScope() {
      $scope.title = menu.activePage.title;
      $scope.content = $sce.trustAsHtml(menu.activePage.content);
      $scope.$emit('ass-page-data-applied');
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