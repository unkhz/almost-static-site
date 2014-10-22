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
          if ( h ) {
            pel.style.minHeight = h + 'px';
          }
        }
        function updateScope(e) {
          // Wait for the reflow and set parent height
          for ( var i = 0; i < 5; i++ ) {
            $timeout(setParentHeight,i*200);
          }
        }
        $scope.$on('ass-page-data-applied', updateScope);
        $window.addEventListener('resize', updateScope);
      }
    };
  }
];