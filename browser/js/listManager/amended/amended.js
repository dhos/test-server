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
    $scope.displayLetters = $scope.letters.filter(letter => {
        return letter.state === 3
    })
    $state.transition = (lc_number) => {
        $state.go('singleLc', {
            lc_number: lc_number
        })
    }
});