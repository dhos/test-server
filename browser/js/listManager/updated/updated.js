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
    $scope.displayLetters = $scope.letters.filter(letter => {
        return letter.state === 5
    })
    $scope.transition = (lcNumber) => {
        $state.go('singleLc', {
            lcNumber: lcNumber
        })
    }
});