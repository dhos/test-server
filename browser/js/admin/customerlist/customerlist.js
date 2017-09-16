app.config(function($stateProvider) {
    $stateProvider.state('customerList', {
        templateUrl: 'js/admin/customerList/customerList.html',
        controller: 'customerListCtrl',
        url: '/customers',
        resolve: {
            customers: customerFactory => {
                return customerFactory.getCustomers({}).then(customers => {
                    return customers
                })
            }
        }
    })
});

app.controller('customerListCtrl', function($scope, customers, userFactory, $state, $rootScope, LETTER_EVENTS, lcFactory) {
    $scope.customers = customers
    $scope.deleteUser = (UserId, index) => {
        $scope.customers.splice(index, 1)
        userFactory.deleteUser({
            id: UserId
        })
    }
    $scope.editCustomer = (UserId) => {
        $state.go('editCustomer', {
            userId: UserId
        })
    }
    $scope.newUser = () => {
        $state.go('newCustomer')
    }

});