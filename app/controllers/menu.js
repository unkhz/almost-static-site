'use strict';

module.exports = [
  'config', 'menu', '$scope',
  function MenuCtrl(config, menu, $scope) {

    var featureControllers = {
      submenu: require('../features/submenu')
    };

    var _ = require('lodash');

    function updateScope(){
      if ( menu.activePage ) {
        var features = [];
        menu.activePage.recurseParents(function(page){
          features = features.concat(page.getFeatures(featureControllers));
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