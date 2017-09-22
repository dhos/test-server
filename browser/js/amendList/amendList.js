app.config(function($stateProvider) {
    $stateProvider.state('amendList', {
        templateUrl: 'js/amendList/amendList.html',
        controller: 'amendListCtrl',
        url: '/amendList',
        resolve: {
            amended: lcFactory => {
                return lcFactory.getLetters({
                    state: 3
                }).then(letters => {
                    return letters
                })
            }
        }
    })
});

app.controller('amendListCtrl', function($scope, amended, $state, countryFactory, userFactory, bankFactory, lcFactory, LETTER_EVENTS, $rootScope, customerFactory, clientFactory) {
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
    $scope.customers = {}
    customerFactory.getCustomers({}).then(customer => {
        customer.forEach(customer => {
            $scope.customers[customer.id] = customer.name
        })
    })
    $scope.clients = {}
    clientFactory.getClients({}).then(clients => {
        clients.forEach(client => {
            $scope.clients[client.id] = client.name
        })
    })
    $scope.letters = amended
    $scope.transition = (lc_number) => {
        $state.go('amendLc', {
            lc_number: lc_number
        })
    }
    $scope.dateDesc = {
        date: false,
        expire: false
    }
    $scope.sortByDate = (params) => {
        $scope.dateDesc[params] = !$scope.dateDesc[params]
        if ($scope.dateDesc[params]) {
            $scope.letters.sort((a, b) => {
                return new Date(a[params]) - new Date(b[params])
            })
        } else {
            $scope.letters.sort((a, b) => {
                return new Date(b[params]) - new Date(a[params])
            })
        }
    }

    $scope.alphaDesc = {
        country: false,
        client: false
    }
    $scope.sortByAlphabet = (params) => {
        $scope.alphaDesc[params] = !$scope.alphaDesc[params]
        if ($scope.alphaDesc[params]) {
            $scope.letters.sort((a, b) => {
                return a[params] - b[params]
            })
        } else {
            $scope.letters.sort((a, b) => {
                return b[params] - a[params]
            })
        }
    }
    $scope.deleteLC = (lc_number, index) => {
        openModal('Delete Letter', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {
                $scope.letters.splice(index, 1)
                lcFactory.deleteLetter({
                    lc_number: lc_number
                })
            }
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