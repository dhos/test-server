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
    $scope.displayLetters = $scope.New
    console.log($scope.letters)
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Revised'
    }
    $scope.transition = (lc_number) => {
        $state.go('singleLc', {
            lc_number: lc_number
        })
    }
});