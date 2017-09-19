app.config(function($stateProvider) {
    $stateProvider.state('listManager.expiring', {
        templateUrl: 'js/listManager/expiring/expiring.html',
        controller: 'expiringCtrl',
        url: '/listManager/expiring'
    })
});

app.controller('expiringCtrl', ($scope, lcFactory, expiring, $state) => {
    $scope.letters = $scope.Expiring
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Revised'
    }
    $scope.transition = (lcNumber) => {
        $state.go('singleLc', {
            lc_number: lcNumber
        })
    }
    $scope.updateFinDoc = (index) => {
        if ($scope.letters[index].finDoc !== 0) {
            lcFactory.updateLetter($scope.letters[index]).then(letter => {
                $scope.letters[index].toggled = false
            })
        }
    }
});