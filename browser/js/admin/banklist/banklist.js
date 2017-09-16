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

app.controller('banklistCtrl', function($scope, banks, bankFactory, $state, $rootScope, LETTER_EVENTS, lcFactory) {
    $scope.banks = banks
    $scope.deleteBank = (bankId, index) => {
        $scope.banks.splice(index, 1)
        bankFactory.deleteBank({
            id: bankId
        }).then(banks => {
            $scope.banks = banks
        })
    }
    $scope.editBank = (bankId) => {
        $state.go('editBank', {
            bankId: bankId
        })
    }
    $scope.newBank = () => {
        $state.go('newBank')
    }
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Revised'
    }
});