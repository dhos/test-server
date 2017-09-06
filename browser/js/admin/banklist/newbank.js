app.config(function($stateProvider) {
    $stateProvider.state('newBank', {
        templateUrl: 'js/admin/banklist/newBank.html',
        controller: 'newBankCtrl',
        url: '/newBank',
        resolve: {}
    })
});

app.controller('newBankCtrl', function($scope, bankFactory, $state) {
    $scope.createBank = (bank) => {
        bankFactory.createBank(bank).then(bank => {
            $state.go('banklist')
        })
    }

});