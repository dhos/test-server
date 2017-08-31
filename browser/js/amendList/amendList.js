app.config(function($stateProvider) {
    $stateProvider.state('amendList', {
        templateUrl: 'js/amendList/amendList.html',
        controller: 'amendListCtrl',
        url: '/amendList',
        resolve: {
            amended: (lcFactory) => {
                return lcFactory.getLetters({
                    state: 3
                }).then(amended => {
                    return amended
                })
            }
        }
    })
});

app.controller('amendListCtrl', function($scope, amended, $state, countryFactory, userFactory, bankFactory) {
    //get banks
    $scope.banks = {}
    bankFactory.getBanks({}).then(banks => {
            banks.forEach(bank => {
                $scope.banks[bank.id] = bank.name
            })
        })
        //get countries
    $scope.countries = {}
    countryFactory.getCountries({}).then(countries => {
        countries.forEach(country => {
            $scope.countries[country.id] = country.name
        })
    })

    //get picusers
    $scope.picUsers = {}
    userFactory.getUsers({
            role: 1
        }).then(picUsers => {
            picUsers.forEach(user => {
                $scope.picUsers[user.id] = user.username
            })
        })
        //get cspusers
    $scope.cspUsers = {}
    userFactory.getUsers({
        role: 2
    }).then(cspUsers => {
        cspUsers.forEach(user => {
            $scope.cspUsers[user.id] = user.username
        })
    })
    $scope.letters = amended
    $scope.transition = (lc_number) => {
        $state.go('amendLc', {
            lc_number: lc_number
        })
    }
});