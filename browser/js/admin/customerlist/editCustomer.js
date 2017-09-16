app.config(function($stateProvider) {
    $stateProvider.state('editCustomer', {
        templateUrl: 'js/admin/customerList/newCustomer.html',
        controller: 'editCustomerCtrl',
        url: '/editCustomer/:userId',
        resolve: {
            customer: (customerFactory, $stateParams) => {
                return customerFactory.getSingleCustomer($stateParams.userId).then(customer => {
                    //remember to shortcircuit if it's not a customer
                    return customer
                })
            },
        }
    })
});

app.controller('editCustomerCtrl', function($scope, customerFactory, $state, customer, $rootScope, LETTER_EVENTS, lcFactory) {
    $scope.user = customer
    $scope.user.number = Number($scope.user.number)
    console.log($scope.user)
    $scope.makeUser = (user) => {
        customerFactory.updateCustomer(user).then(user => {
            $state.go('customerList')
        })
    }
});