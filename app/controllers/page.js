'use strict';


var PageCtrl = function($rootScope, $scope, $routeParams, $http, $sce, $filter) {
  if ( !$routeParams.page ) { return; }

  $scope.isActive = false;
  $scope.data = {
    title:'',
    content:''
  }

  $http.get('/api/pages/' + $sce.trustAsUrl($routeParams.page) + '.json').success(function(res){
    $scope.data = res;
  });
};

module.exports = PageCtrl;