app.config(function($stateProvider) {
    $stateProvider.state('customerList', {
        templateUrl: 'js/admin/customerList/customerList.html',
        controller: 'customerListCtrl',
        url: '/customers',
        resolve: {
            customers: userFactory => {
                return userFactory.getUsers({
                    role: 0
                }).then(customers => {
                    return customers
                })
            }
        }
    })
});

app.controller('customerListCtrl', function($scope, customers, userFactory, $state) {
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