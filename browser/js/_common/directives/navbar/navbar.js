app.directive('navbar', function($rootScope, AuthService, AUTH_EVENTS, $state, LETTER_EVENTS, lcFactory, Socket) {
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
                    Socket.emit('logon', user)
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
            var state = {
                1: 'New',
                2: 'Reviewed',
                3: 'Amended',
                4: 'Frozen',
                5: 'Revised'
            }
            var refreshLetters = () => {
                lcFactory.getLetters({}).then(letters => {
                    scope.letters = letters
                    scope.New = []
                    scope.Reviewed = []
                    scope.Revised = []
                    scope.Amended = []
                    scope.Frozen = []
                    scope.Update = []
                    scope.letters = letters
                        //set states
                    scope.letters.forEach(letter => {
                        scope[state[letter.state]].push(letter)
                    })
                    scope.Frozen.forEach(frozen => {
                        if (frozen.finDoc === 0) scope.Update.push(frozen)
                    })
                })
                lcFactory.getExpiringLetters({}).then(expiring => {
                    scope.Expiring = expiring[0]
                })
            }
            $rootScope.$on(LETTER_EVENTS.refreshLetters, refreshLetters);

            refreshLetters();
            setUser();


            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);

        }

    };

});