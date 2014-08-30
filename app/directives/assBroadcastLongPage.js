'use strict';

var BroadcastLongPage = function($rootScope, $window, $timeout) {
  return {
    restrict: 'A',
    link: function($scope, el, attrs) {
      $rootScope.isWaitingForPageHeight = true;
      $scope.$on('ass-page-data-applied', function(complete) {
        // Wait for the reflow
        $timeout(function(){
          var h = el[0].offsetHeight,
              containerH = $window.outerHeight - document.getElementById('header').offsetHeight;
          $rootScope.isLongPage = h > containerH;
          $rootScope.isWaitingForPageHeight = false;
        },0);
      });
    }
  };
};

module.exports = BroadcastLongPage;