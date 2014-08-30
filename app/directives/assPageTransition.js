'use strict';

var assPageTransition = function($rootScope, $window, $timeout) {
  return {
    restrict: 'A',
    link: function($scope, el, attrs) {
      $rootScope.$on('activate:page', function(e, newPage, oldPage) {
        if ( newPage && oldPage ) {
          // Page change is horizontal
          el.attr('ass-transition-direction', newPage.ord > (oldPage ? oldPage.ord : 0) ? 'rtl' : 'ltr');
        } else {
          // Initial load is vertical
          el.attr('ass-transition-direction', 'fade');
        }
      });
    }
  };
};

module.exports = assPageTransition;