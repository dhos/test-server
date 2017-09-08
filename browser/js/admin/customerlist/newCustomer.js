app.config(function($stateProvider) {
    $stateProvider.state('newCustomer', {
        templateUrl: 'js/admin/customerlist/newCustomer.html',
        controller: 'newCustomerCtrl',
        url: '/newCustomer',
        resolve: {}
    })
});

app.controller('newCustomerCtrl', function($scope, userFactory, $state) {
    $scope.createUser = (user) => {
        user.role = 0
        userFactory.createUser(user).then(user => {
            $state.go('customerList')
        })
    }


});