app.directive('navbar', function($rootScope, AuthService, AUTH_EVENTS, $state) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/_common/directives/navbar/navbar.html',
        link: function(scope) {

            scope.user = null;
            scope.query = ""
            scope.isLoggedIn = function() {
                return AuthService.isAuthenticated();
            };

            scope.logout = function() {
                AuthService.logout().then(function() {
                    $state.go('landing');
                });
            };

            var setUser = function() {
                AuthService.getLoggedInUser().then(function(user) {
                    scope.user = user;

                });
            };

            var removeUser = function() {
                scope.user = null;
            };

            scope.search = () => {

                if ($('#search-text')[0].value) {
                    $state.go('singleLc', {
                        lc_number: $('#search-text')[0].value
                    })
                    $('#search-text').val("")
                }
            }

            setUser();


            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);

        }

    };

});