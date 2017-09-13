app.config(function($stateProvider) {
    $stateProvider.state('newCustomer', {
        templateUrl: 'js/admin/customerList/newCustomer.html',
        controller: 'newCustomerCtrl',
        url: '/newCustomer',
        resolve: {}
    })
});

app.controller('newCustomerCtrl', function($scope, userFactory, $state, $rootScope, LETTER_EVENTS, lcFactory) {
    $scope.makeUser = (user) => {
        user.role = 0
        userFactory.createUser(user).then(user => {
            $state.go('customerList')
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
