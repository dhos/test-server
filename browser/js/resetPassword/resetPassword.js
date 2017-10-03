app.config(function($stateProvider) {
    $stateProvider.state('resetPassword', {
        templateUrl: 'js/resetPassword/resetPassword.html',
        controller: 'resetPasswordCtrl',
        url: '/reset',
        resolve: {
            user: AuthService => {
                return AuthService.getLoggedInUser().then(user => {
                    return user
                })
            }
        },
        data: {
            authenticate: true
        }
    })
});

app.controller('resetPasswordCtrl', function($scope, AuthService, userFactory, $state, user) {
    $scope.user = user
    $scope.updatePassword = function(form) {
        if (form.confirm !== form.password) {
            $scope.error = 'Your entries do not match';
            return
        }
        userFactory.resetPassword($scope.user.id, form.password).then(() => {
            AuthService.logout().then(() => $state.go('landing'))
        })
    };
})