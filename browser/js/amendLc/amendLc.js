app.config(function($stateProvider) {
    $stateProvider.state('amendLc', {
        templateUrl: 'js/amendLc/amendLc.html',
        controller: 'amendLcCtrl',
        url: '/amend/:lc_number',
        resolve: {
            letter: (lcFactory, $stateParams) => {
                return lcFactory.getSingleLetter($stateParams.lc_number).then(letter => {
                    return letter
                })
            }
        }
    })
});

app.controller('amendLcCtrl', ($scope, lcFactory, countryFactory, userFactory, bankFactory, letter, $state) => {
    $scope.letter = letter

    $scope.updateLc = () => {
        lcFactory.updateLetterFile($scope.letter, $scope.updatedFile).then(letter => {
            $state.go('singleLc', {
                lc_number: letter.lc_number
            })

        })
    }

    //get banks
    bankFactory.getBanks({}).then(banks => {
            $scope.banks = banks
        })
        //get countries
    countryFactory.getCountries({}).then(countries => {
            $scope.countries = countries
        })
        //get picusers
    userFactory.getUsers({
            role: 1
        }).then(picUsers => {
            $scope.picUsers = picUsers
        })
        //get cspusers
    userFactory.getUsers({
            role: 2
        }).then(cspUsers => {
            $scope.cspUsers = cspUsers
        })
        //get clients
    userFactory.getUsers({
        role: 3
    }).then(clients => {
        $scope.clients = clients
    })

})