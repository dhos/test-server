app.config(function($stateProvider) {
    $stateProvider.state('listManager.all', {
        templateUrl: 'js/listManager/all/all.html',
        controller: 'allCtrl',
        url: '/listManager',
        // data: {
        //     authenticate: true
        // },
        resolve: {
            letters: (lcFactory) => {
                return lcFactory.getLetters({}).then(letters => {
                    return letters
                })
            }
        }
    })
});

app.controller('allCtrl', ($scope, lcFactory, letters, $state) => {
    $scope.letters = letters
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Pending Update'
    }
    $scope.transition = (lcNumber) => {
        $state.go('singleLc', {
            lc_number: lcNumber
        })
    }
});