'use strict';

module.exports = [
  '$rootScope', '$window', '$timeout',
  function BroadcastScrollPositionDirective($rootScope, $window, $timeout) {
    return {
      restrict: 'A',
      link: function($scope, $el, attrs) {
        var el = attrs.assBroadcastScrollPosition ? eval(attrs.assBroadcastScrollPosition) : document.body;
        $rootScope.assBroadcastScrollPosition = 0;
        var p = $timeout();
        function updateScope() {
          $timeout.cancel(p);
          p = $timeout(function(){
            $rootScope.$apply(function(){
              $rootScope.assBroadcastScrollPosition = el.scrollTop - el.offsetHeight + window.innerHeight*2.5;
            });
          });
        }
        $window.addEventListener('scroll', updateScope);
        $window.addEventListener('touchstart', updateScope);
        $el[0].addEventListener('DOMSubtreeModified', updateScope);
      }
    };
  }
];