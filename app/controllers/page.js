'use strict';

var PageCtrl = function(config, $rootScope, $scope, $routeParams, $http, $sce, $filter, $timeout) {
  $scope.data = {
    title:'',
    content:''
  }

  function loadPage(pageId) {
    var url = config.url('api/pages/' + $sce.trustAsUrl(pageId) + '.json');
    $http.get(url).success(function(res){
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
      var unbindWatch = $rootScope.$watch('menu.rootPage', function(page){
        if ( page ) {
          loadPage(page.id);
          unbindWatch();
        }
      });
    }
  } else {
    loadPage($routeParams.pageId);
  }

};

module.exports = PageCtrl;