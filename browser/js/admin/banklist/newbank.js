app.config(function($stateProvider) {
    $stateProvider.state('newBank', {
        templateUrl: 'js/admin/banklist/newbank.html',
        controller: 'newBankCtrl',
        url: '/newBank',
        resolve: {}
    })
});

app.controller('newBankCtrl', function($scope, bankFactory, $state, $rootScope, LETTER_EVENTS, lcFactory, usSpinnerService, openModal) {
    $scope.createBank = (bank) => {
        openModal('Create Bank', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {
                bankFactory.createBank(bank).then(bank => {
                    $state.go('banklist')
                })
            }
        })
    }
});