'use strict';

var PageCtrl = function($scope, $routeParams, $http, $sce) {
  if ( !$routeParams.page ) { return; }
  $scope.isActive = false;
  $http.get('/api/' + $sce.trustAsUrl($routeParams.page)).success(function(res){
    $scope.data = res;
  });
};

module.exports = PageCtrl;