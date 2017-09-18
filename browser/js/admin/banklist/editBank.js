app.config(function($stateProvider) {
    $stateProvider.state('editBank', {
        templateUrl: 'js/admin/banklist/newbank.html',
        controller: 'editBankCtrl',
        url: '/editBank/:bankId',
        resolve: {
            bank: (bankFactory, $stateParams) => {
                return bankFactory.getSingleBank($stateParams.bankId).then(bank => {
                    return bank
                })
            }
        }
    })
});

app.controller('editBankCtrl', function($scope, bankFactory, $state, bank, $rootScope, LETTER_EVENTS, lcFactory, openModal) {
    $scope.bank = bank
    $scope.updateBank = (bank) => {
        openModal('Edit Bank', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {

                bankFactory.updateBank(bank).then(bank => {
                    $state.go('banklist')
                })
            }
        })
    }

});