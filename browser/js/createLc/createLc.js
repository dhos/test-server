app.config(function($stateProvider) {
    $stateProvider.state('createLc', {
        templateUrl: 'js/createLc/createLc.html',
        controller: 'createLcCtrl',
        url: '/createLc'
    })
});

app.controller('createLcCtrl', function($scope, lcFactory, countryFactory, userFactory, bankFactory, $state, LETTER_EVENTS, $rootScope, customerFactory) {
    //find the users that are clients,
    //find the users that are csp/pic
    $scope.selectedCountry = {}
    $scope.selectedClient = {}
    $scope.createLc = () => {
        $scope.letter.state = 1
        $scope.letter.client = $scope.selectedClient.id
        $scope.letter.country = $scope.selectedCountry.id
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
        //getclient
    customerFactory.getCustomers({}).then(clients => {
        $scope.clients = clients
    })
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Revised'
    }
    var refreshLetters = () => {
        lcFactory.getLetters({}).then(letters => {
            $scope.letters = letters
            $scope.New = []
            $scope.Reviewed = []
            $scope.Amended = []
            $scope.Frozen = []
            $scope.Revised = []
            $scope.Update = []
            $scope.letters = letters
                //set states
            $scope.letters.forEach(letter => {
                $scope[$scope.state[letter.state]].push(letter)
            })
            $scope.Frozen.forEach(frozen => {
                if (frozen.finDoc === 0) $scope.Update.push(frozen)
            })
        })
        lcFactory.getExpiringLetters({}).then(expiring => {
            $scope.Expiring = expiring[0]
        })
    }
    $rootScope.$on(LETTER_EVENTS.refreshLetters, refreshLetters);

    refreshLetters();

});