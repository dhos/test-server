app.config(function($stateProvider) {
    $stateProvider.state('newUser', {
        templateUrl: 'js/admin/userlist/newuser.html',
        controller: 'newUserCtrl',
        url: '/newUser',
        resolve: {
            countries: (countryFactory) => {
                return countryFactory.getCountries({}).then(countries => {
                    return countries
                })
            },
            customers: (userFactory) => {
                return userFactory.getUsers({
                    role: 0
                }).then(customers => {
                    return customers
                })
            }
        }
    })
});

app.controller('newUserCtrl', function($scope, userFactory, $state, $rootScope, LETTER_EVENTS, lcFactory, countries, customers) {
    $scope.countries = countries
    $scope.customers = customers
    $scope.createUser = (user) => {
        user.countries = []
        user.customers = []
        for (let key of Object.keys($scope.selectedCountries)) {
            if ($scope.selectedCountries[key]) user.countries.push(key)
        }
        for (let key of Object.keys($scope.selectedCustomers)) {
            if ($scope.selectedCustomers[key]) user.customers.push(key)
        }
        console.log(user)

        userFactory.createUser(user).then(user => {
            $state.go('userlist')
        })
    }
    $scope.selectedCountries = {}
    $scope.selectedCustomers = {}
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Revised'
    }
    var refreshLetters = () => {
        lcFactory.getLetters({}).then(letters => {
            $scope.letters = letters
            $scope.New = []
            $scope.Reviewed = []
            $scope.Amended = []
            $scope.Frozen = []
            $scope.Revised = []
            $scope.Update = []
            $scope.letters = letters
                //set states
            $scope.letters.forEach(letter => {
                $scope[$scope.state[letter.state]].push(letter)
            })
            $scope.Frozen.forEach(frozen => {
                if (frozen.finDoc === 0) $scope.Update.push(frozen)
            })
        })
        lcFactory.getExpiringLetters({}).then(expiring => {
            $scope.Expiring = expiring[0]
        })
    }
    $rootScope.$on(LETTER_EVENTS.refreshLetters, refreshLetters);

    refreshLetters();

});