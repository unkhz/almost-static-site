'use strict';

var PageCtrl = function($rootScope, $scope, $routeParams, $http, $sce, $filter, $timeout) {

  $scope.data = {
    title:'',
    content:''
  }

  function loadPage(pageId) {
    $http.get('/api/pages/' + $sce.trustAsUrl(pageId) + '.json').success(function(res){
      $scope.data = res;
      // Wait after the digest so that
      $timeout(function(){
        $scope.$emit("ass-page-data-applied")
      },0);
    });
  }

  if ( !$routeParams.pageId ) {
    if ( $rootScope.menu && $rootScope.menu.rootPage ) {
      loadPage($rootScope.menu.rootPage.id);
    } else {
      $rootScope.$watch('menu.rootPage', function(page){
        if ( page ) {
          loadPage(page.id);
        }
      });
    }
  } else {
    loadPage($routeParams.pageId);
  }

};

module.exports = PageCtrl;