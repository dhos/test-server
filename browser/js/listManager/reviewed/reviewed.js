app.config(function($stateProvider) {
    $stateProvider.state('listManager.reviewed', {
        templateUrl: 'js/listManager/reviewed/reviewed.html',
        controller: 'reviewedCtrl',
        url: '/listManager/reviewed',
        parent: 'listManager',
        // data: {
        //     authenticate: true
        // },
        resolve: {}
    })
});

app.controller('reviewedCtrl', ($scope, lcFactory, letters, $state) => {
    $scope.$watch('reviewedCustomer', (nv, ov) => {
        if (nv === false) {
            $scope.displayLetters = $scope.needsClientReviewed
        } else {
            $scope.displayLetters = $scope.needsBusinessReviewed
        }
    })
    $scope.transition = (lc_number) => {
        $state.go('singleLc', {
            lc_number: lc_number
        })
    }
});