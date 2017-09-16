app.config(function($stateProvider) {
    $stateProvider.state('newCustomer', {
        templateUrl: 'js/admin/customerList/newCustomer.html',
        controller: 'newCustomerCtrl',
        url: '/newCustomer',
        resolve: {}
    })
});

app.controller('newCustomerCtrl', function($scope, customerFactory, $state, $rootScope, LETTER_EVENTS, lcFactory) {
    $scope.makeUser = (user) => {
        user.role = 0
        customerFactory.createCustomer(user).then(user => {
            $state.go('customerList')
        })
    }

});