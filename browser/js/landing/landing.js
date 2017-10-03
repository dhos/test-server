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
    console.log('hello')
    $scope.authError = null;
    $scope.sendLogin = function(loginInfo) {
        $scope.error = null;
        console.log('test')
        AuthService.login(loginInfo).then(function() {
            jQuery('body').removeClass('loginpage')
            $state.transitionTo('dashboard');
        }).catch(err => {
            $scope.authError = err.message.data;
        })
    };
})