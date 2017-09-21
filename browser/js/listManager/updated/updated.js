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

app.controller('updatedCtrl', ($scope, lcFactory, letters, $state, openModal) => {
    $scope.displayLetters = $scope.Update
    console.log($scope.displayLetters)
    $scope.transition = (lc_number) => {
        $state.go('singleLc', {
            lc_number: lc_number
        })
    }
    $scope.updateFinDoc = (index) => {
        if ($scope.displayLetters[index].finDoc !== 0) {
            openModal('Input FD Number', 'Are you sure?', 'prompt', 'confirm').then(result => {
                if (result) {
                    lcFactory.updateLetter($scope.displayLetters[index]).then(letter => {
                        $scope.displayLetters[index].toggled = false
                    })
                }
            })
        }
    }
});