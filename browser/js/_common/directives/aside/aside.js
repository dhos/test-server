app.directive('sidebar', function($rootScope, AuthService, AUTH_EVENTS, $state) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/_common/directives/aside/aside.html',
        link: function(scope, lcFactory) {
            // lcFactory.getLetterCount().then(letterCount => {
            //     scope.letterCount = letterCount
            // })
        }

    };

});