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
            scope.state = {
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
                    scope.updatedLetters = []
                    scope.csp = scope.user.role === 2
                    if (scope.user.role !== 4) {
                        scope.letters = letters.filter(letter => {
                            let bool = true
                            if (scope.user.countries.indexOf(letter.country) === -1) bool = false
                            if (scope.user.customers.indexOf(letter.client) === -1) bool = false
                            if (scope.csp) bool = letter.csp == $scope.user.id
                            else bool = letter.pic == scope.user.id
                            return bool
                        })
                    }
                    //set states
                    scope.letters.forEach(letter => {
                        scope[scope.state[letter.state]].push(letter)
                        if (letter.state == 4 && letter.finDoc === 0) scope.Update.push(letter)
                        if ((Date.now() - Date.parse(letter.updatedAt)) < (60 * 60 * 1000 * 24 * 7)) scope.updatedLetters.push(letter)
                    })
                })
                lcFactory.getExpiringLetters({}).then(expiring => {
                    if (scope.user.role === 4) {
                        scope.Expiring = expiring[0].filter(letter => {
                            let bool = true
                            if (scope.user.countries.indexOf(letter.country) === -1) bool = false
                            if (scope.user.customers.indexOf(letter.client) === -1) bool = false
                            return bool
                        })
                    }
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