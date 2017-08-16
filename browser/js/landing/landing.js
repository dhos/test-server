app.config(function($stateProvider) {
    $stateProvider.state('landing', {
        templateUrl: 'js/landing/landing.html',
        controller: 'landingCtrl',
        url: '/'
    })
});

app.controller('landingCtrl', function($scope) {

});