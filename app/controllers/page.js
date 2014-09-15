'use strict';

module.exports = [
  'config', 'menu', '$scope', '$rootScope', '$routeParams',
  function PageCtrl(config, menu, $scope, $rootScope, $routeParams) {

    var featureControllers = {
      toc: require('../features/toc'),
      content: require('../features/content'),
      includes: require('../features/includes')
    }

    function updateScope() {
      if ( menu.activePage && menu.activePage.features && menu.activePage.features.length ) {
        var features = [];
        angular.forEach(menu.activePage.features, function(featureId) {
          if ( featureControllers[featureId] ) {
            features.push({
              controller: featureControllers[featureId]
            });
          }
        });
        $scope.features = features;
      }
      $scope.$emit("ass-page-data-applied")
    }

    angular.extend($scope, {
      level:0,
      features: [{
        controller: featureControllers.content
      }],
      title:'',
      content:'',
      children:[]
    });

    // Make sure that toc is updated on all menu updates
    $scope.$on('activate:page', updateScope);
    menu.promises.isComplete.then(updateScope);
  }
];