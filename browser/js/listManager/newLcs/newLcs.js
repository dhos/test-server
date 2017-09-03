app.config(function($stateProvider) {
    $stateProvider.state('listManager.newLcs', {
        templateUrl: 'js/listManager/newLcs/newLcs.html',
        controller: 'newLcsCtrl',
        url: '/listManager/newLcs',
        parent: 'listManager',
        // data: {
        //     authenticate: true
        // },
        resolve: {}
    })
});

app.controller('newLcsCtrl', ($scope, lcFactory, letters, $state) => {
    $scope.displayLetters = $scope.letters.filter(letter => {
        return letter.state === 1
    })
    console.log($scope.letters)
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Pending Update'
    }
    $scope.transition = (lcNumber) => {
        $state.go('singleLc', {
            lc_number: lc_number
        })
    }
});