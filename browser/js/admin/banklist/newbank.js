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
