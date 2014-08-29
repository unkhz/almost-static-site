'use strict';

var MenuCtrl = function($rootScope, $scope, $http, $filter) {
  $scope.template = "views/menu.html";
  $rootScope.menu = {
    pages: []
  };

  // Change active menu button when route changes
  $scope.setActive = function(toPageId) {
    var rootPageId = $rootScope.menu.rootPageId,
        pages = $rootScope.menu.pages;
    if ( !pages.length ) { return; }

    angular.forEach(pages, function(page, ord){
      if ( page.id === toPageId || ( !toPageId && page.isRoot ) ) {
        page.isActive = true;
        $rootScope.menu.activePage = page;
      } else {
        page.isActive = false;
      }
    });
  }

  $scope.$on("$routeChangeSuccess", function(event,toState) {
    $scope.setActive(toState.params.pageId);
  });

  // Fill menu
  $http.get('/api/menu.json').success(function(res){
    if ( res && res.pages ) {
      angular.forEach(res.pages, function(page, ord){
        page.ord = ord;
        if ( page.isRoot ) {
          res.rootPage = page;
        }
        angular.extend($rootScope.menu, res);
      });
    } else {
      throw new Error('ASS Error: Invalid menu model received from API', res);
    }
  });
};

module.exports = MenuCtrl;