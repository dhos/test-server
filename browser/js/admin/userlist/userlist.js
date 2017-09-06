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

app.controller('userlistCtrl', function($scope, users, userFactory, $state) {
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

});