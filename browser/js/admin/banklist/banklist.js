app.config(function($stateProvider) {
    $stateProvider.state('banklist', {
        templateUrl: 'js/admin/banklist/banklist.html',
        controller: 'banklistCtrl',
        url: '/banks',
        resolve: {
            banks: bankFactory => {
                return bankFactory.getBanks({}).then(banks => {
                    return banks
                })
            }
        }
    })
});

app.controller('banklistCtrl', function($scope, banks, bankFactory, $state) {
    $scope.banks = banks
    $scope.deleteBank = (bankId) => {
        bankFactory.deleteBank({
            id: bankId
        }).then(banks => {
            $scope.banks = banks
        })
    }
    $scope.editBank = (bankId) => {
        console.log(bankId)
        $state.go('editBank', {
            bankId: bankId
        })
    }
    $scope.newBank = () => {
        $state.go('newBank')
    }
});