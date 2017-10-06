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
            customers: (customerFactory) => {
                return customerFactory.getCustomers({}).then(customers => {
                    return customers
                })
            }
        }
    })
});

app.controller('newUserCtrl', function($scope, userFactory, $state, $rootScope, LETTER_EVENTS, lcFactory, countries, customers, openModal) {
    $scope.countries = countries
    $scope.customers = customers
    $scope.newUser = {}
    $scope.newUser.manager = false
    $scope.makeUser = (user) => {
        openModal('Create User', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {
                newUser.countries = []
                newUser.customers = []
                for (let key of Object.keys($scope.selectedCountries)) {
                    if ($scope.selectedCountries[key]) newUser.countries.push(key)
                }
                for (let key of Object.keys($scope.selectedCustomers)) {
                    if ($scope.selectedCustomers[key]) newUser.customers.push(key)
                }
                userFactory.createUser(newUser).then(user => {
                    $state.go('userlist')
                })
            }
        })
    }
    $scope.selectedCountries = {}
    $scope.selectedCustomers = {}

});