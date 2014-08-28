'use strict';


var PageCtrl = function($rootScope, $scope, $routeParams, $http, $sce, $filter, $timeout) {
  if ( !$routeParams.page ) { return; }

  $scope.isActive = false;
  $scope.data = {
    title:'',
    content:''
  }

  $http.get('/api/pages/' + $sce.trustAsUrl($routeParams.page) + '.json').success(function(res){
    $scope.data = res;
    // Wait after the digest so that
    $timeout(function(){
      $scope.$emit("ass-page-data-applied")
    },0);
  });
};

module.exports = PageCtrl;