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
    $scope.letters = letters
    $scope.sortedLetters = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: []
    }
    $scope.banks = {}
    bankFactory.getBanks({}).then(banks => {
        banks.forEach(bank => {
            $scope.banks[bank.id] = bank.name
        })
    })
    console.log($scope.banks)
        //get countries
    $scope.countries = {}
    countryFactory.getCountries({}).then(countries => {
        countries.forEach(country => {
            $scope.countries[country.id] = country.name
        })
    })
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
    userFactory.getUsers({
        role: 0
    }).then(customers => {
        customers.forEach(customer => {
            $scope.customers[user.id] = customer.username
        })
    })
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Pending Update'
    }
    $scope.letters.forEach(letter => {
        $scope.sortedLetters[letter.state].push(letter)
    })
    console.log($scope.sortedLetters)
    $scope.amendedCustomer = false
    $scope.reviewedCustomer = false

})