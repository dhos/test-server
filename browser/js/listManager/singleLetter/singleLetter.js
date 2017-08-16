app.config(function($stateProvider) {
    $stateProvider.state('singleLetter', {
        templateUrl: 'js/listManager/singleLetter/singleLetter.html',
        controller: 'singleLetterCtrl',
        url: '/listManager/:id',
        resolve: {
            letter: (lcFactory, $stateParams) => {
                return lcFactory.getSinglerLetter($stateParams.id).then(letter => {
                    return letter
                })
            }
        }
    })
});

app.controller('singleLetterCtrl', function($scope, letter, lcFactory) {
    //inits

    $scope.letter = letter

    //end inits
    $scope.updateLetter = letterToBeUpdated => {
        lcFactory.updateLetter(letterToBeUpdated).then(updatedLetter => {
            //perhaps this should be a create rather than an update
            $scope.letter = updatedLetter
        })
    }
});