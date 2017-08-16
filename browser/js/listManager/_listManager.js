app.config(function($stateProvider) {
    $stateProvider.state('listManager', {
        templateUrl: 'js/listManager/_listManager.html',
        controller: 'listManagerCtrl',
        url: '/listManager',
        data: {
            authenticat: true
        },
        resolve: {
            letters: (lcFactory) => {
                return lcFactory.getLetters({}).then(letters => {
                    return letters
                })
            }
        }
    })
});

app.controller('listManagerCtrl', function($scope, lcFactory) {
    $scope.createLC = () => {
        //opens a modal for a new lc
        //.then to creat the lc and then go to it
    }

    $scope.viewSingleLetter = (letterID) => {
        $state.go('singleLetter', {
            id: letterID
        })
    }
});