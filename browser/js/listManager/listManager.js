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
            }
        }
    })
});

app.controller('listManagerCtrl', ($scope, lcFactory, $state, letters, bankFactory, countryFactory, userFactory) => {
    //inits
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
    userFactory.getUsers({
        role: 0
    }).then(customers => {
        customers.forEach(customer => {
            $scope.customers[customer.id] = customer.username
        })
    })
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Pending Update'
    }
    $scope.New = []
    $scope.Reviewed = []
    $scope.Amended = []
    $scope.Frozen = []
    $scope.Update = []
    $scope.amendedCustomer = false
    $scope.reviewedCustomer = false
    $scope.letters = letters
        //set states
    $scope.letters.forEach(letter => {
        $scope[$scope.state[letter.state]].push(letter)
    })
    $scope.Frozen.forEach(frozen => {
        if (frozen.finDoc === 0) $scope.Update.push(frozen)
    })
})