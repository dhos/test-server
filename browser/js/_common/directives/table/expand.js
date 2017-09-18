app.directive('expandable', ['$document', function($document) {
  return {
    restrict: 'EA',
    link: function(scope, element, attr) {
      angular.element(element.nextElementSibling).addClass('ng-hide');
      element.on('click', function(event){
        var ele = angular.element(this.nextElementSibling);
        if(ele.hasClass('ng-hide')){
          ele.removeClass('ng-hide');
        } else {
          ele.addClass('ng-hide');
        }
      });
    }
  };
}]);
