'use strict';

var BroadcastLongPage = function($rootScope, $window, $timeout) {
  return {
    restrict: 'A',
    link: function($scope, el, attrs) {
      $rootScope.isWaitingForPageHeight = true;
      $scope.$on('ass-page-data-applied', function(complete) {
        var h = el[0].offsetHeight,
            containerH = $window.outerHeight - document.getElementById('header').offsetHeight;
        $rootScope.isLongPage = h > containerH;
        $rootScope.isWaitingForPageHeight = false;
      });
    }
  };
};

module.exports = BroadcastLongPage;