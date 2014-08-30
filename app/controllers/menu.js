'use strict';

var MenuCtrl = function(config, $rootScope, $scope, $http, $filter) {
  $scope.template = 'views/menu.html';
  $rootScope.menu = {
    pages: []
  };

  // Change active menu button when route changes
  $scope.setActive = function(toPageId) {
    var rootPageId = $rootScope.menu.rootPageId,
        pages = $rootScope.menu.pages;

    if ( !pages.length ) {
      return;
    }

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
    if ( $rootScope.menu.pages.length ) {
      $scope.setActive(toState.params.pageId);
    } else {
      var unbindWatch = $scope.$on('ass-menu-loaded', function() {
        $scope.setActive(toState.params.pageId);
        unbindWatch();
      });
    }
  });

  // Fill menu
  var url = config.url('api/menu.json');
  $http.get(url).success(function(res){
    if ( res && res.pages ) {
      angular.forEach(res.pages, function(page, ord){
        page.ord = ord;
        page.url = config.url(page.isRoot ? '' : page.id);
        if ( page.isRoot ) {
          res.rootPage = page;
        }
        angular.extend($rootScope.menu, res);
      });
      $scope.$emit('ass-menu-loaded');
    } else {
      throw new Error('ASS Error: Invalid menu model received from API', res);
    }
  });
};

module.exports = MenuCtrl;