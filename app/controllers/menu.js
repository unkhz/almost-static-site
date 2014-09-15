'use strict';

module.exports = [
  'config', 'menu', '$scope',
  function MenuCtrl(config, menu, $scope) {

    var featureControllers = {
      submenu: require('../features/submenu')
    };

    function updateScope(){
      if ( menu.activePage ) {
        var features = [],
            levels = [];
        menu.activePage.recurseParents(function(page){
          // Menu features are repeated once per each sublevel
          if ( page.features && page.features.length ) {
            angular.forEach(page.features, function(featureId) {
              if ( featureControllers[featureId] ) {
                features.unshift({
                  id: featureId + '-' + page.level,
                  level:page.level,
                  pages: page.children,
                  controller: featureControllers[featureId]
                });
              }
            });
          }
        });
        $scope.features = features;
      }
      $scope.pages = menu.rootPages;
    }

    $scope.template = 'views/menu.html'
    $scope.features = [];

    // Make sure that scope is updated on all menu updates
    menu.promises.isComplete.then(updateScope);
    $scope.$on('activate:page', updateScope);
  }
];