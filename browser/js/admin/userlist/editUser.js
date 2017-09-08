app.config(function($stateProvider) {
    $stateProvider.state('editUser', {
        templateUrl: 'js/admin/userlist/editUser.html',
        controller: 'editUserCtrl',
        url: '/editUser/:userId',
        resolve: {
            user: (userFactory, $stateParams) => {
                return userFactory.getSingleUser($stateParams.userId).then(user => {
                    return user
                })
            },
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

app.controller('editUserCtrl', function($scope, userFactory, $state, user, $rootScope, LETTER_EVENTS, lcFactory, countries, customers) {
    $scope.user = user
    $scope.countries = countries
    $scope.customers = customers
    $scope.selectedCountries = {}
    $scope.selectedCustomers = {}
    $scope.user.countries.forEach(country => {
        $scope.selectedCountries[country] = true
    })
    $scope.user.customers.forEach(customer => {
        $scope.selectedCustomers[customer] = true
    })
    $scope.updateUser = (user) => {
        user.countries = []
        user.customers = []
        for (let key of Object.keys($scope.selectedCountries)) {
            if ($scope.selectedCountries[key]) user.countries.push(key)
        }
        for (let key of Object.keys($scope.selectedCustomers)) {
            if ($scope.selectedCustomers[key]) user.customers.push(key)
        }
        userFactory.updateUser(user).then(user => {
            $state.go('userlist')
        })
    }
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Pending Update'
    }
    var refreshLetters = () => {
        lcFactory.getLetters({}).then(letters => {
            $scope.letters = letters
            $scope.New = []
            $scope.Reviewed = []
            $scope.Amended = []
            $scope.Frozen = []
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