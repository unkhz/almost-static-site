/*globals angular*/
'use strict';

module.exports = [
  'config', 'menu', '$scope', '$rootScope', '$routeParams', '$sce',
  function ContentCtrl(config, menu, $scope, $rootScope, $routeParams, $sce) {

    function updateScope() {
      // If this is a subpage, we use the page defined in parent scope
      // Otherwise we use the active page
      var page = $scope.$parent.page || menu.activePage;
      if ( page ) {
        $scope.title = page.title;
        $scope.content = $sce.trustAsHtml(page.content);
        $scope.$emit('ass-page-data-applied');
      }
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