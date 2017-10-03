app.config(function($stateProvider) {
    $stateProvider.state('userlist', {
        templateUrl: 'js/admin/userlist/userlist.html',
        controller: 'userlistCtrl',
        url: '/users',
        resolve: {
            users: userFactory => {
                return userFactory.getUsers({}).then(users => {
                    return users
                })
            }
        }
    })
});

app.controller('userlistCtrl', function($scope, users, userFactory, $state, $rootScope, LETTER_EVENTS, lcFactory, openModal) {
    $scope.users = users.filter(user => {
        return user.role !== 0 && user.role !== 5
    })
    $scope.roles = {
        1: 'PIC',
        2: 'CSP',
        3: 'MANAGER',
        4: 'Admin'
    }
    $scope.deleteUser = (UserId, index) => {
        openModal('Delete User', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {
                $scope.users.splice(index, 1)
                userFactory.deleteUser({
                    id: UserId
                })
            }
        })
    }
    $scope.editUser = (UserId) => {
        $state.go('editUser', {
            userId: UserId
        })
    }
    $scope.resetPassword = (userId) => {
        openModal('Reset Password', 'Are you sure?', 'prompt', 'confirm').then(result => {
            userFactory.resetPassword(userId, 'elite_password').then(() => {
                openModal('Password Reset', 'The password has been reset to "elite_password"', 'notification', 'notification')
            })
        })
    }
    $scope.newUser = () => {
        $state.go('newUser')
    }
});