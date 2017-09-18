app.config(function($stateProvider) {
    $stateProvider.state('amendList', {
        templateUrl: 'js/amendList/amendList.html',
        controller: 'amendListCtrl',
        url: '/amendList',
        resolve: {}
    })
});

app.controller('amendListCtrl', function($scope, amended, $state, countryFactory, userFactory, bankFactory, lcFactory, LETTER_EVENTS, $rootScope, customerFactory) {
    //get banks
    $scope.letters = $scope.Amended
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
    $scope.clients = {}
    customerFactory.getCustomers({}).then(clients => {
        clients.forEach(client => {
            $scope.clients[client.id] = client.username
        })
    })
    $scope.letters = amended
    $scope.transition = (lc_number) => {
        $state.go('amendLc', {
            lc_number: lc_number
        })
    }

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
            $scope.Revised = []
            $scope.Frozen = []
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