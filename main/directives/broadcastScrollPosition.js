'use strict';

// http://stackoverflow.com/a/872537
function getScrollTop(){
  if (typeof pageYOffset!= 'undefined') {
    //most browsers except IE before #9
    return pageYOffset;
  }
  else{
    var B= document.body; //IE 'quirks'
    var D= document.documentElement; //IE with doctype
    D= (D.clientHeight)? D: B;
    return D.scrollTop;
  }
}

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
              $rootScope.assBroadcastScrollPosition = getScrollTop() - el.offsetHeight + window.innerHeight*2.5;
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