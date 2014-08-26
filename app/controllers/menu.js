'use strict';

var MenuCtrl = function($rootScope, $scope, $http, $filter) {
  $scope.template = "views/menu.html";

  // Change active menu button when route changes
  $scope.setActive = function(page) {
    var oldPageId, newPageId;
    $scope.items.forEach(function(item, id){
      if ( item.isActive ) {
        oldPageId = id;
      }
      if ( item.page === page ) {
        item.isActive = true;
        newPageId = id;
      } else {
        item.isActive = false;
      }
    });
    $rootScope.routeData.newPageId = newPageId;
    $rootScope.routeData.oldPageId = oldPageId;
  }

  $scope.$on("$routeChangeSuccess", function(event,toState) {
    $scope.setActive(toState.params.page);
  });

  // Fill menu
  $http.get('/api/menu').success(function(res){
    $rootScope.menuItems = res.items;
    $scope.items = res.items;
    $scope.activeClass = "ass-is-active";
  });
};

module.exports = MenuCtrl;