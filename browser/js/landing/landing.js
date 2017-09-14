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
    jQuery('body').addClass('loginpage')
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
            jQuery('body').removeClass('loginpage')
            AuthService.login(login)
        })
    }

    console.log(jQuery('body'))
    $scope.sendLogin = function(loginInfo) {
        jQuery('body').removeClass('loginpage')
        $scope.error = null;
        AuthService.login(loginInfo).then(function() {
            $state.transitionTo('dashboard');
        })
    };
})