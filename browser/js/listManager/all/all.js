app.config(function($stateProvider) {
    $stateProvider.state('listManager.all', {
        templateUrl: 'js/listManager/all/all.html',
        controller: 'allCtrl',
        url: '/listManager',
        // data: {
        //     authenticate: true
        // },
        resolve: {}
    })
});

app.controller('allCtrl', ($scope, lcFactory, $state, openModal) => {

    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Revised'
    }
    $scope.checkReviewed = (letter) => {
        return (letter.state !== 2 && letter.state !== 5)
    }
    $scope.transition = (lcNumber) => {
        $state.go('singleLc', {
            lc_number: lcNumber
        })
    }
    $scope.updateFinDoc = (index) => {
        if ($scope.letters[index].finDoc !== 0) {
            openModal('Input FD Number', 'Are you sure?', 'prompt', 'confirm').then(result => {
                if (result) {
                    if (Date.now() > $scope.letters[index].ship_date) {
                        openModal('Shipping Date Passed', 'That letter cannot be updated.', 'warning', 'warning')
                        return
                    }
                    lcFactory.updateLetter($scope.letters[index]).then(letter => {
                        $scope.letters[index].toggled = false
                    })
                }
            })
        }
    }
});