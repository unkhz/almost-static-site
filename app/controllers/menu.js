'use strict';

var MenuCtrl = function(config, $rootScope, $scope, $http, $sce, $filter) {
  $scope.template = 'views/menu.html';
  var menu = $rootScope.menu = {
    pages: [],
    pagesById: {}
  };

  // Change active menu button when route changes
  $scope.setActive = function(toPageId) {
    if ( !menu.pages.length ) { return; }

    var toPage = menu.pagesById[toPageId] || menu.rootPage;
    if ( menu.activePage ) {
      menu.activePage.isActive = false;
    }
    toPage.isActive = true;
    menu.activePage = toPage;
  }

  $scope.$on("$routeChangeSuccess", function(event,toState) {
    if ( menu.pages.length ) {
      $scope.setActive(toState.params.pageId);
    } else {
      var unbindWatch = $scope.$on('ass-menu-loaded', function() {
        console.log('menu loaded');
        $scope.setActive(toState.params.pageId);
        unbindWatch();
      });
    }
  });

  // Fill menu
  var url = config.url('api/menu.json');
  $http.get(url).success(function(res){
    if ( res && res.pages ) {
      res.pagesById = {};
      angular.forEach(res.pages, function(page, ord){
        page.ord = ord;
        page.url = config.url(page.isRoot ? '' : page.id);
        res.pagesById[page.id] = page;
        if ( page.isRoot ) {
          res.rootPage = page;
        }
        angular.extend(menu, res);

        // Get data also
        var dataUrl = config.url('api/pages/' + $sce.trustAsUrl(page.id) + '.json');
        $http.get(dataUrl).success(function(res){
          page.data = res;
          $rootScope.$emit('page-loaded:'+page.id);
        });
      });
      $scope.$emit('ass-menu-loaded');
    } else {
      throw new Error('ASS Error: Invalid menu model received from API', res);
    }
  });
};

module.exports = MenuCtrl;