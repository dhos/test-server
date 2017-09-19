app.directive('navbar', function($rootScope, AuthService, AUTH_EVENTS, $state, LETTER_EVENTS, lcFactory, Socket, openModal) {
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
                openModal('Logout', 'Are you sure you want to logout?', 'prompt', 'confirm').then(result => {
                    if (result) {
                        AuthService.logout().then(function() {
                            $state.go('landing');
                        });
                    }
                })
            };

            var setUser = function() {
                AuthService.getLoggedInUser().then(function(user) {
                    scope.user = user;
                    Socket.emit('logon', user)
                });
                refreshLetters();
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
            scope.roles = {
                1: 'PIC',
                2: 'CSP',
                4: 'Admin'
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
                    scope.manager = scope.user.manager
                    if (scope.user.role !== 4 && !scope.manager) {
                        scope.letters = letters.filter(letter => {
                            let bool = true
                            if (scope.user.countries.indexOf(letter.country) === -1) bool = false
                            if (scope.user.customers.indexOf(letter.customer) === -1) bool = false
                            if (scope.csp) bool = letter.csp == scope.user.id
                            else bool = letter.pic == scope.user.id
                            return bool
                        })
                    } else {
                        scope.letters = letters
                    }
                    //set states
                    scope.letters.forEach(letter => {
                        scope[scope.state[letter.state]].push(letter)
                        if (letter.state == 4 && letter.finDoc === 0) scope.Update.push(letter)
                        if ((Date.now() - Date.parse(letter.updatedAt)) < (60 * 60 * 1000 * 24 * 7)) scope.updatedLetters.push(letter)
                    })
                    scope.updatedLetters.sort((a, b) => {
                        return a.updatedAt - b.updatedAt
                    })
                })
                lcFactory.getExpiringLetters({}).then(expiring => {
                    if (scope.user.role !== 4) {
                        scope.Expiring = expiring[0].filter(letter => {
                            let bool = true
                            if (scope.user.countries.indexOf(letter.country) === -1) bool = false
                            if (scope.user.customers.indexOf(letter.customer) === -1) bool = false
                            if (scope.csp) bool = letter.csp == scope.user.id
                            else bool = letter.pic == scope.user.id
                            return bool
                        })
                    } else {
                        scope.Expiring = expiring[0]
                    }
                })
            }
            $rootScope.$on(LETTER_EVENTS.refreshLetters, refreshLetters);
            setUser();


            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);

        }

    };

});