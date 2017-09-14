app.config(function($stateProvider) {
    $stateProvider.state('landing', {
        templateUrl: 'js/landing/landing.html',
        controller: 'landingCtrl',
        url: '/',
        resolve: {
            user: (AuthService, $state) => {
                AuthService.getLoggedInUser().then(user => {
                    if (user) $state.go('dashboard')
                })
            }
        }
    })
});

app.controller('landingCtrl', function($scope, AuthService, userFactory, $state) {

    $scope.login = {};
    $scope.error = null;
    $scope.createUser = () => {
        console.log('hello')
        let login = {
            username: 'test',
            password: 'test'
        }
        userFactory.createUser({
            user: login
        }).then(user => {
            AuthService.login(login)
        })
    }

    console.log(jQuery('body'))
    $scope.sendLogin = function(loginInfo) {

        $scope.error = null;
        AuthService.login(loginInfo).then(function() {
            $state.transitionTo('dashboard');
        })
    };
})