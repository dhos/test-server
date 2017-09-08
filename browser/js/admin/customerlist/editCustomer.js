app.config(function($stateProvider) {
    $stateProvider.state('editCustomer', {
        templateUrl: 'js/admin/customerlist/editCustomer.html',
        controller: 'editCustomerCtrl',
        url: '/editCustomer/:userId',
        resolve: {
            user: (userFactory, $stateParams) => {
                return userFactory.getSingleUser($stateParams.userId).then(user => {
                    //remember to shortcircuit if it's not a customer
                    return user
                })
            }
        }
    })
});

app.controller('editCustomerCtrl', function($scope, userFactory, $state, user) {
    $scope.user = user
    $scope.updateUser = (user) => {
        userFactory.updateUser(user).then(user => {
            $state.go('customerList')
        })
    }

});