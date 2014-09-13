'use strict';

module.exports = [
  'config', 'menu', '$scope', '$rootScope', '$routeParams',
  function PageCtrl(config, menu, $scope, $rootScope, $routeParams) {

    function updateScope() {
      $scope.title = menu.activePage.title;
      $scope.content = menu.activePage.content;
      $scope.children = menu.activePage.children
        && menu.activePage.children.length
        && menu.activePage.includesChildren
        ? menu.activePage.children : [];
      $scope.$emit("ass-page-data-applied")
    }

    angular.extend($scope, {
      templates: {
        toc: 'views/page-toc.html',
        include: 'views/page-include.html'
      },
      title:'',
      content:'',
      children:[]
    });

    // Make sure that toc is updated on all menu updates
    $scope.$on('activate:page', updateScope);
    menu.promises.isComplete.then(updateScope);
  }
];