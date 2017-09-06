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
    $scope.$watch('amendedCustomer', (nv, ov) => {
        if (nv === true) {
            $scope.displayLetters = $scope.letters.filter(letter => {
                return letter.state === 3
            })
            $scope.displayLetters = $scope.letters.filter(letter => {
                return letter.approved[0] === '0'
            })
        } else {
            $scope.displayLetters = $scope.letters.filter(letter => {
                return letter.state === 3
            })
            $scope.displayLetters = $scope.letters.filter(letter => {
                return letter.approved[1] === '0'
            })
        }
    })
    $state.transition = (lc_number) => {
        $state.go('singleLc', {
            lc_number: lc_number
        })
    }
});