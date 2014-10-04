'use strict';

module.exports = [
  'config', 'menu', 'features', '$scope',
  function MenuCtrl(config, menu, features, $scope) {

    var _ = require('lodash');

    function updateScope(){
      if ( menu.activePage ) {
        var levels = [];
        menu.activePage.recurseParents(function(page){
          levels.push({
            id: page.level,
            features: _.filter(page.features, function(f){
              return f.targetComponentId === 'menu';
            }),
            styles: page.stylesClassName
          });
        });
        $scope.levels = levels;
        $scope.styles = menu.activePage.styles ? 'ass-style-' + menu.activePage.styles.join(' ass-style-') : '';
      }
      $scope.pages = menu.rootPages;
    }

    $scope.template = 'main/views/menu.html';
    $scope.features = [];
    $scope.levels = [];

    // Make sure that scope is updated on all menu updates
    menu.promises.isComplete.then(updateScope);
    $scope.$on('activate:page', updateScope);
  }
];