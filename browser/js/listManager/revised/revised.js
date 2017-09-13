app.config(function($stateProvider) {
    $stateProvider.state('listManager.revised', {
        templateUrl: 'js/listManager/revised/revised.html',
        controller: 'revisedCtrl',
        url: '/listManager/revised',
        parent: 'listManager',
        // data: {
        //     authenticate: true
        // },
        resolve: {}
    })
});

app.controller('revisedCtrl', ($scope, lcFactory, letters, $state) => {
    $scope.$watch('revisedCustomer', (nv, ov) => {
        if (nv === true) {
            $scope.displayLetters = $scope.Revised.filter(letter => {
                return !letter.client_approved
            })
        } else {
            $scope.displayLetters = $scope.Revised.filter(letter => {
                return !letter.business_approved
            })
        }
    })

    $scope.transition = (lc_number) => {
        $state.go('singleLc', {
            lc_number: lc_number
        })
    }
});