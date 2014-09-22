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
        var levels = [];
        menu.activePage.recurseParents(function(page){
          levels.push({
            id: page.level,
            features: page.getFeatures(featureControllers),
            styles: page.styles ? "ass-style-" + page.styles.join(" ass-style-") : ""
          });
        });
        $scope.levels = levels;
        $scope.styles = menu.activePage.styles ? "ass-style-" + menu.activePage.styles.join(" ass-style-") : "";
      }
      $scope.pages = menu.rootPages;
    }

    $scope.template = 'views/menu.html'
    $scope.levels = [];

    // Make sure that scope is updated on all menu updates
    menu.promises.isComplete.then(updateScope);
    $scope.$on('activate:page', updateScope);
  }
];