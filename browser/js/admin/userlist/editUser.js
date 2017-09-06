app.config(function($stateProvider) {
    $stateProvider.state('editUser', {
        templateUrl: 'js/admin/userlist/editUser.html',
        controller: 'editUserCtrl',
        url: '/editUser/:userId',
        resolve: {
            user: (userFactory, $stateParams) => {
                return userFactory.getSingleUser($stateParams.userId).then(user => {
                    return user
                })
            }
        }
    })
});

app.controller('editUserCtrl', function($scope, userFactory, $state, user) {
    $scope.user = user
    $scope.updateUser = (user) => {
        userFactory.updateUser(user).then(user => {
            $state.go('userlist')
        })
    }

});