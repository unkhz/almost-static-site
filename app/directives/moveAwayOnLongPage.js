'use strict';

module.exports = [
  '$rootScope', '$window', '$timeout',
  function MoveAwayOnLongPageDirective($rootScope, $window, $timeout) {
    return {
      restrict: 'A',
      link: function($scope, el, attrs) {
        $rootScope.$watch('isWaitingForPageHeight', function(newValue, oldValue) {
          if ( newValue && $rootScope.isLongPage ) {
            // footer is away from view, hide it as soon as possible to avoid flash
            el.addClass("is-invisible");
          }
        });
        $rootScope.$watch('isLongPage', function(newValue, oldValue) {
          if ( newValue ) {
            // slide out, when short page -> long page
            el.addClass("is-away");
            $timeout(function(){
              el.removeClass("is-away");
            },1000);
          } else if ( oldValue ) {
            // slide in, when long page -> short page
            el.addClass("is-invisible is-away");
            $timeout(function(){
              el.removeClass("is-invisible is-away");
            },1000);
          }
        });
      }
    };
  }
];