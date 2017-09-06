app.config(function($stateProvider) {
    $stateProvider.state('listManager.frozen', {
        templateUrl: 'js/listManager/frozen/frozen.html',
        controller: 'frozenCtrl',
        url: '/listManager/frozen',
        parent: 'listManager',
        // data: {
        //     authenticate: true
        // },
        resolve: {
            letters: (lcFactory) => {
                return lcFactory.getLetters({
                    state: 4
                }).then(letters => {
                    return letters
                })
            }
        }
    })
});

app.controller('frozenCtrl', ($scope, lcFactory, letters, $state) => {
    $scope.displayLetters = $scope.letters.filter(letter => {
        return letter.state === 4
    })
    $scope.transition = (lc_number) => {
        $state.go('singleLc', {
            lc_number: lc_number
        })
    }
});