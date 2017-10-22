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

app.controller('revisedCtrl', ($scope, lcFactory, $state) => {

    $scope.$watch('revisedCustomer', (nv, ov) => {
        if (nv === false) {
            $scope.displayLetters = $scope.needsClientRevised
        } else {
            $scope.displayLetters = $scope.needsBusinessRevised
        }
    })
    $scope.transition = (lc_number) => {
        $state.go('singleLc', {
            lc_number: lc_number
        })
    }
});