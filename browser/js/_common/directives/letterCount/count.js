app.directive('count', function($state, LETTER_EVENTS, lcFactory, $rootScope) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/_common/directives/letterCount/count.html',
        link: function(scope) {
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
                    scope.Amended = []
                    scope.Revised = []
                    scope.Frozen = []
                    scope.Update = []
                    scope.amendedCustomer = false
                    scope.reviewedCustomer = false
                    scope.letters = letters
                        //set states
                    scope.letters.forEach(letter => {
                        scope[scope.state[letter.state]].push(letter)
                    })
                    scope.Frozen.forEach(frozen => {
                        if (frozen.finDoc === 0) scope.Update.push(frozen)
                    })
                })
                lcFactory.getExpiringLetters({}).then(expiringLetters => {
                    scope.Expiring = expiringLetters
                })
            }
            refreshLetters()
            $rootScope.$on(LETTER_EVENTS.refreshLetters, refreshLetters);
        }
    };

});