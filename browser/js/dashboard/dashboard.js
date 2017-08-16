app.config(function($stateProvider) {
    $stateProvider.state('dashboard', {
        templateUrl: 'js/dashboard/dashboard.html',
        controller: 'dashboardCtrl',
        url: '/dashboard',
        // data: {
        //     authenticate: true
        // },
        resolve: {
            // letters: (lcFactory) => {
            //     return lcFactory.getLetters({}).then(letters => {
            //         return letters
            //     })
            // }
        }
    })
});

app.controller('dashboardCtrl', function($scope, $state) {

    //inits
    // $scope.letters = letters
    //$scope.analytics = analytics

    //end inits





});