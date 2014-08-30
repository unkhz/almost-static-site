'use strict';

var PageCtrl = function(config, $rootScope, $scope, $routeParams, $http, $sce, $filter, $timeout) {
  $scope.data = {
    title:'',
    content:''
  }

  function applyPageData(pageId) {
      $scope.data = $rootScope.menu.pagesById[pageId].data;
      // Wait after the digest to emit
      $timeout(function(){
        $scope.$emit("ass-page-data-applied")
      },0);
  }

  function loadPage(pageId) {
    var menu = $rootScope.menu;
    if ( menu && menu.pagesById[pageId] && menu.pagesById[pageId].data ) {
      applyPageData(pageId);
    } else {
      var rm = $rootScope.$on('page-loaded:'+pageId, function(){
        applyPageData(pageId);
        rm();
      });
    }
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