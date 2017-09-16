app.config(function($stateProvider) {
    $stateProvider.state('newBank', {
        templateUrl: 'js/admin/banklist/newbank.html',
        controller: 'newBankCtrl',
        url: '/newBank',
        resolve: {}
    })
});

app.controller('newBankCtrl', function($scope, bankFactory, $state, $rootScope, LETTER_EVENTS, lcFactory) {

    $scope.createBank = (bank) => {
        bankFactory.createBank(bank).then(bank => {
            $state.go('banklist')
        })
    }
});