'use strict';

module.exports = [
  '$compile',
  function CompileHtmlDirective($compile) {
    return {
      restrict: 'A',
      link: function($scope, $el, attrs) {
        $scope.$watch(
          function($scope) {
            // watch the 'compile' expression for changes
            return $scope.$eval(attrs.assCompileHtml);
          },
          function(value) {
            $el.html(value);
            $compile($el.contents())($scope);
          }
        );
      }
    };
  }
];