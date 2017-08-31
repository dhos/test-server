app.directive('chat', function($rootScope, AuthService, AUTH_EVENTS, $state) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/_common/directives/chat/chat.html',
        link: function(scope, Socket) {
            scope.chat = false
            scope.open = () => {
                console.log(scope.chat)
                scope.chat = !scope.chat
            }

        }

    };

});