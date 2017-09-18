app.config(function($stateProvider) {
    $stateProvider.state('editCustomer', {
        templateUrl: 'js/admin/customerlist/newCustomer.html',
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

app.controller('editCustomerCtrl', function($scope, customerFactory, $state, customer, $rootScope, LETTER_EVENTS, lcFactory, openModal) {
    $scope.user = customer
    $scope.user.number = Number($scope.user.number)
    $scope.makeUser = (user) => {
        openModal('Edit Customer', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {

                customerFactory.updateCustomer(user).then(user => {
                    $state.go('customerList')
                })
            }
        })
    }
});