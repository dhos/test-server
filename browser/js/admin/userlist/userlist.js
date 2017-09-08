app.config(function($stateProvider) {
    $stateProvider.state('userlist', {
        templateUrl: 'js/admin/userlist/userlist.html',
        controller: 'userlistCtrl',
        url: '/users',
        resolve: {
            users: userFactory => {
                return userFactory.getUsers({
                    // $or: [{
                    //     role: 1
                    // }, {
                    //     role: 2
                    // }]
                }).then(users => {
                    return users
                })
            }
        }
    })
});

app.controller('userlistCtrl', function($scope, users, userFactory, $state, $rootScope, LETTER_EVENTS, lcFactory) {
    $scope.users = users
    $scope.roles = {
        1: 'CSP',
        2: 'PIC',
        3: 'MANAGER',
        4: 'Admin'
    }
    $scope.deleteUser = (UserId, index) => {
        $scope.users.splice(index, 1)
        userFactory.deleteUser({
            id: UserId
        })
    }
    $scope.editUser = (UserId) => {
        $state.go('editUser', {
            userId: UserId
        })
    }
    $scope.newUser = () => {
        $state.go('newUser')
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