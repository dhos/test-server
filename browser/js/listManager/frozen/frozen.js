app.config(function($stateProvider) {
    $stateProvider.state('listManager.frozen', {
        templateUrl: 'js/listManager/frozen/frozen.html',
        controller: 'frozenCtrl',
        url: '/listManager/frozen',
        parent: 'listManager',
        // data: {
        //     authenticate: true
        // },
        resolve: {}
    })
});

app.controller('frozenCtrl', ($scope, lcFactory, letters, $state, openModal) => {
    $scope.displayLetters = $scope.Frozen
    $scope.transition = (lc_number) => {
        $state.go('singleLc', {
            lc_number: lc_number
        })
    }
    $scope.updateFinDoc = (index) => {
        if ($scope.displayLetters[index].finDoc !== 0) {
            openModal('Create LC', 'Are you sure?', 'prompt', 'confirm').then(result => {
                if (result) {
                    lcFactory.updateLetter($scope.displayLetters[index]).then(letter => {
                        $scope.displayLetters[index].toggled = false
                    })
                }
            })
        }
    }
});