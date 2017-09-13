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
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Revised'
    }
    var refreshLetters = () => {
        lcFactory.getLetters({}).then(letters => {
            $scope.letters = letters
            $scope.New = []
            $scope.Reviewed = []
            $scope.Amended = []
            $scope.Frozen = []
            $scope.Revised = []
            $scope.Update = []
            $scope.letters = letters
                //set states
            $scope.letters.forEach(letter => {
                $scope[$scope.state[letter.state]].push(letter)
            })
            $scope.Frozen.forEach(frozen => {
                if (frozen.finDoc === 0) $scope.Update.push(frozen)
            })
        })
        lcFactory.getExpiringLetters({}).then(expiring => {
            $scope.Expiring = expiring[0]
        })
    }
    $rootScope.$on(LETTER_EVENTS.refreshLetters, refreshLetters);

    refreshLetters();
});