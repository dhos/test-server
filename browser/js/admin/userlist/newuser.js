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
    $scope.makeUser = (user) => {
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

});