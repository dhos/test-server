app.config(function($stateProvider) {
    $stateProvider.state('customerList', {
        templateUrl: 'js/admin/customerlist/customerlist.html',
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
        openModal('Delete Customer', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if(result){
                
                $scope.customers.splice(index, 1)
                userFactory.deleteUser({
                    id: UserId
                })
            }
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