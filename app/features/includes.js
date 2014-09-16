'use strict';

module.exports = [
  'config', 'menu', '$scope', '$rootScope', '$routeParams',
  function IncludeCtrl(config, menu, $scope, $rootScope, $routeParams) {

    function updateScope() {
      var includes = [];
      if ( menu.activePage ) {
        menu.activePage.recurseChildren(function(p){
          if ( p.id !== menu.activePage.id ) {
            includes.push(p);
          }
        });
      }
      includes.sort(function(a,b){ return a.ord > b.ord; });
      $scope.includes = includes;
    }

    angular.extend($scope, {
      template: 'features/includes.html',
      children:[]
    });

    // Make sure that toc is updated on all menu updates
    $scope.$on('activate:page', updateScope);
    menu.promises.isComplete.then(updateScope);
  }
];