'use strict';

var MenuCtrl = function($scope, $http) {
  $scope.template = "views/menu.html";
  $http.get('/api/menu').success(function(res){
    $scope.items = res.items;
    $scope.activeClass = "ass-is-active";
  });
};

module.exports = MenuCtrl;