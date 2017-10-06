app.controller('mainCtrl', ($scope, lcFactory, $rootScope, LETTER_EVENTS) => {
    $scope.main = 'hello'
    let refreshLetters = () => {
        lcFactory.getLetters({}).then(letters => {
            $scope.mainLetters = letters
        })
    }
    $rootScope.$on(LETTER_EVENTS.refreshLetters, refreshLetters);
    refreshLetters()
})