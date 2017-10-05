app.controller('mainCtrl', ($scope, lcFactory) => {
    $scope.main = 'hello'
    lcFactory.getLetters({}).then(letters => {
        $scope.mainLetters = letters
    })
})