app.config(function($stateProvider) {
    $stateProvider.state('createLc', {
        templateUrl: 'js/createLc/createLc.html',
        controller: 'createLcCtrl',
        url: '/createLc'
    })
});

app.controller('createLcCtrl', function($scope, lcFactory, countryFactory, userFactory, bankFactory) {
    //find the users that are clients,
    //find the users that are csp/pic
    $scope.createLc = () => {
        lcFactory.createLetter($scope.letter, $scope.file).then(letter => {
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

});