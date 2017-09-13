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
        if (nv === true) {
            $scope.displayLetters = $scope.Reviewed.filter(letter => {
                return letter.client_approved
            })
        } else {
            $scope.displayLetters = $scope.Reviewed.filter(letter => {
                return letter.business_approved
            })
        }
    })

    $scope.transition = (lc_number) => {
        $state.go('singleLc', {
            lc_number: lc_number
        })
    }
});