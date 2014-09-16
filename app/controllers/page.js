'use strict';

module.exports = [
  'config', 'menu', '$scope', '$rootScope', '$routeParams',
  function PageCtrl(config, menu, $scope, $rootScope, $routeParams) {

    var featureControllers = {
      toc: require('../features/toc'),
      content: require('../features/content'),
      filter: require('../features/filter'),
      includes: require('../features/includes')
    }

    function updateScope() {
      if ( menu.activePage ) {
        $scope.features = menu.activePage.getFeatures(featureControllers);
      }
      $scope.$emit("ass-page-data-applied")
    }

    angular.extend($scope, {
      level:0,
      features: [],
      title:'',
      content:'',
      children:[]
    });

    // Make sure that toc is updated on all menu updates
    $scope.$on('activate:page', updateScope);
    menu.promises.isComplete.then(updateScope);
  }
];