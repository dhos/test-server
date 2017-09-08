app.config(function($stateProvider) {
    $stateProvider.state('newUser', {
        templateUrl: 'js/admin/userlist/newUser.html',
        controller: 'newUserCtrl',
        url: '/newUser',
        resolve: {}
    })
});

app.controller('newUserCtrl', function($scope, userFactory, $state, $rootScope, LETTER_EVENTS, lcFactory) {
    $scope.createUser = (user) => {
        console.log(user)
        userFactory.createUser(user).then(user => {
            $state.go('userlist')
        })
    }
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Pending Update'
    }
    var refreshLetters = () => {
        lcFactory.getLetters({}).then(letters => {
            $scope.letters = letters
            $scope.New = []
            $scope.Reviewed = []
            $scope.Amended = []
            $scope.Frozen = []
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