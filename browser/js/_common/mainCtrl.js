app.controller('mainCtrl', ($scope, lcFactory, $rootScope, LETTER_EVENTS) => {
    $scope.main = 'hello'
    lcFactory.getLetters({}).then(letters => {
        $scope.mainLetters = letters
    })

    $rootScope.$on()
})