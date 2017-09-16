app.config(function($stateProvider) {
    $stateProvider.state('listManager', {
        templateUrl: 'js/listManager/listManager.html',
        controller: 'listManagerCtrl',
        abstract: true,
        data: {
            authenticate: true
        },
        resolve: {
            letters: (lcFactory) => {
                return lcFactory.getLetters({}).then(letters => {
                    return letters
                })
            },
            expiring: (lcFactory) => {
                return lcFactory.getExpiringLetters({}).then(letters => {
                    return letters
                })
            },
            user: (AuthService) => {
                return AuthService.getLoggedInUser().then(user => {
                    return user
                })
            }
        }
    })
});

app.controller('listManagerCtrl', ($scope, lcFactory, $state, letters, bankFactory, countryFactory, userFactory, LETTER_EVENTS, $rootScope, customerFactory, expiring, user) => {
    //inits
    $scope.user = user
    $scope.csp = $scope.user.role === 2
    if ($scope.user.role !== 4) {
        $scope.letters = letters.filter(letter => {
            let bool = true
            if ($scope.user.countries.indexOf(letter.country) === -1) bool = false
            if ($scope.user.customers.indexOf(letter.client) === -1) bool = false
            if (scope.csp) bool = letter.csp == $scope.user.id
            else bool = letter.pic == scope.user.id
            return bool
        })
    } else {
        $scope.letters = letters
    }
    console.log($scope.user, $scope.letters)
    $scope.banks = {}
        //get banks
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
        //get pic
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
        //get customers
    $scope.customers = {}
    customerFactory.getCustomers({}).then(customers => {
        customers.forEach(customer => {
            $scope.customers[customer.id] = customer.name
        })
    })
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Revised'
    }
    $scope.New = []
    $scope.Reviewed = []
    $scope.Amended = []
    $scope.Revised = []
    $scope.Frozen = []
    $scope.Update = []
    $scope.Expiring = expiring[0].filter(letter => {
        let bool = true
        if ($scope.user.countries.indexOf(letter.country) === -1) bool = false
        if ($scope.user.customers.indexOf(letter.client) === -1) bool = false
        return bool
    })
    $scope.revisedCustomer = false
    $scope.reviewedCustomer = false

    //set states
    $scope.letters.forEach(letter => {
        $scope[$scope.state[letter.state]].push(letter)
    })
    $scope.Frozen.forEach(frozen => {
        if (frozen.finDoc === 0) $scope.Update.push(frozen)
    })

    var refreshLetters = () => {
        lcFactory.getLetters({}).then(letters => {
            $scope.letters = letters
            $scope.New = []
            $scope.Reviewed = []
            $scope.Amended = []
            $scope.Revised = []
            $scope.Frozen = []
            $scope.Update = []
            $scope.amendedCustomer = false
            $scope.reviewedCustomer = false
            if (scope.user.role == 4) {
                $scope.letters = letters.filter(letter => {
                    let bool = true
                    if ($scope.user.countries.indexOf(letter.country) === -1) bool = false
                    if ($scope.user.customers.indexOf(letter.client) === -1) bool = false
                    if (scope.csp) bool = letter.csp == $scope.user.id
                    else bool = letter.pic == scope.user.id
                    return bool
                })
            }
            //set states
            $scope.letters.forEach(letter => {
                $scope[$scope.state[letter.state]].push(letter)
                if (letter.state == 4 && letter.finDoc === 0) scope.Update.push(letter)
            })
        })
    }
    $rootScope.$on(LETTER_EVENTS.refreshLetters, refreshLetters);
})