app.config(function($stateProvider) {
    $stateProvider.state('listManager.amended', {
        templateUrl: 'js/listManager/amended/amended.html',
        controller: 'amendedCtrl',
        url: '/listManager/amended',
        // data: {
        //     authenticate: true
        // },
        resolve: {}
    })
});

app.controller('amendedCtrl', ($scope, lcFactory, letters, $state) => {
    console.log($scope.Amended)
    $scope.$watch('amendedCustomer', (nv, ov) => {
        if (nv === true) {
            $scope.displayLetters = $scope.Amended.filter(letter => {
                return letter.approved[0] === '0'
            })
        } else {
            $scope.displayLetters = $scope.Amended.filter(letter => {
                return letter.approved[1] === '0'
            })
        }
    })
    $scope.transition = (lc_number) => {
        $state.go('singleLc', {
            lc_number: lc_number
        })
    }
});