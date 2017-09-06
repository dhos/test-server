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
            $scope.displayLetters = $scope.letters.filter(letter => {
                return letter.state === 2
            })
            $scope.displayLetters = $scope.letters.filter(letter => {
                return letter.approved[0] === '0'
            })
        } else {
            $scope.displayLetters = $scope.letters.filter(letter => {
                return letter.state === 2
            })
            $scope.displayLetters = $scope.letters.filter(letter => {
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