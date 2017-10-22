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
    $scope.authError = null;
    $scope.sendLogin = function(loginInfo) {
        $scope.authError = null;
        AuthService.login(loginInfo).then(function() {
            jQuery('body').removeClass('loginpage')
            $state.transitionTo('dashboard');
        }).catch(err => {
            console.log(err)
            $scope.authError = err.message.data;
        })
    };
})