'use strict';

module.exports = [
  '$rootScope', '$window', '$timeout',
  function PageTransitionDirective($rootScope, $window, $timeout) {
    return {
      restrict: 'A',
      link: function($scope, el, attrs) {
        $rootScope.$on('activate:page', function(e, newPage, oldPage) {
          if ( newPage === oldPage ) {
            // Page change isinstant inside same pager
            el.attr('ass-transition-direction', 'none');
          } else if ( newPage && oldPage && newPage.parent && newPage.parent.id === oldPage.id ) {
            // Page change is vertical from page to subpage
            el.attr('ass-transition-direction', 'ttb');
          } else if ( newPage && oldPage && oldPage.parent && oldPage.parent.id === newPage.id ) {
            // Page change is vertical from subpage to page
            el.attr('ass-transition-direction', 'btt');
          } else if ( newPage && oldPage ) {
            // Page change is horizontal
            el.attr('ass-transition-direction', newPage.ord > (oldPage ? oldPage.ord : 0) ? 'rtl' : 'ltr');
          } else {
            // Initial load is vertical
            el.attr('ass-transition-direction', 'fade');
          }
        });
      }
    };
  }
];