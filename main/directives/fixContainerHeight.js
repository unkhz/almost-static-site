'use strict';

module.exports = [
  '$rootScope', '$window', '$timeout',
  function FixContainerHeight($rootScope, $window, $timeout) {
    return {
      restrict: 'A',
      link: function($scope, el) {
        function setParentHeight() {
          var pel = el[0].parentNode;
          var h = el[0].offsetHeight;
          var ph = pel.style.minHeight;
          if ( h > 0 && h + 'px' !== ph ) {
            pel.style.minHeight = h + 'px';
          }
        }
        // Wait for the content to be appended and set parent height
        function waitAndSet() {
          var i;
          var times = [0,200,400,700,1000,1500,2000];
          var len = times.length;
          for ( i = 0; i < len; i++ ) {
            $timeout(setParentHeight,times[i]);
          }
        }
        $scope.$on('ass-page-data-applied', waitAndSet);
        $window.addEventListener('resize', setParentHeight);
      }
    };
  }
];