app.config(function($stateProvider) {
    $stateProvider.state('editUser', {
        templateUrl: 'js/admin/userlist/newuser.html',
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
            customers: (customerFactory) => {
                return customerFactory.getCustomers({}).then(customers => {
                    return customers
                })
            }
        }
    })
});

app.controller('editUserCtrl', function($scope, userFactory, $state, user, $rootScope, LETTER_EVENTS, lcFactory, countries, customers, openModal) {
    $scope.user = user
    $scope.countries = countries
    $scope.customers = customers
    console.log(customers)
    $scope.selectedCountries = {}
    $scope.selectedCustomers = {}
    $scope.user.countries.forEach(country => {
        $scope.selectedCountries[country] = true
    })
    $scope.user.customers.forEach(customer => {
        $scope.selectedCustomers[customer] = true
    })
    $scope.makeUser = (user) => {
        openModal('Edit User', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {
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
        })
    }

});