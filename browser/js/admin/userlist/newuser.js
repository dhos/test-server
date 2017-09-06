app.config(function($stateProvider) {
    $stateProvider.state('newUser', {
        templateUrl: 'js/admin/userlist/newUser.html',
        controller: 'newUserCtrl',
        url: '/newUser',
        resolve: {}
    })
});

app.controller('newUserCtrl', function($scope, userFactory, $state) {
    $scope.createUser = (user) => {
        console.log(user)
        userFactory.createUser(user).then(user => {
            $state.go('userlist')
        })
    }


});