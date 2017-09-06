app.config(function($stateProvider) {
    $stateProvider.state('editBank', {
        templateUrl: 'js/admin/banklist/editBank.html',
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

app.controller('editBankCtrl', function($scope, bankFactory, $state, bank) {
    $scope.bank = bank
    $scope.updateBank = (bank) => {
        bankFactory.updateBank(bank).then(bank => {
            $state.go('banklist')
        })
    }

});