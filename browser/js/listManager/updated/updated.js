app.config(function($stateProvider) {
    $stateProvider.state('listManager.updated', {
        templateUrl: 'js/listManager/updated/updated.html',
        controller: 'updatedCtrl',
        url: '/listManager/updated',
        // data: {
        //     authenticate: true
        // },
        resolve: {}
    })
});

app.controller('updatedCtrl', ($scope, lcFactory, letters, $state) => {
    $scope.displayLetters = $scope.Update
    console.log($scope.displayLetters)
    $scope.transition = (lc_number) => {
        $state.go('singleLc', {
            lc_number: lc_number
        })
    }
});