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

app.controller('listManagerCtrl', ($scope, lcFactory, $state, letters, bankFactory, countryFactory, userFactory, LETTER_EVENTS, $rootScope, customerFactory, expiring, user, clientFactory) => {
    //inits
    $scope.user = user
    $scope.csp = $scope.user.role === 2
    $scope.manager = $scope.user.manager
    if ($scope.user.role !== 4 && !$scope.manager) {
        $scope.letters = letters.filter(letter => {
            let bool = true
            if ($scope.user.countries.indexOf(letter.country) === -1) bool = false
            if ($scope.user.customers.indexOf(letter.customer) === -1) bool = false
            if ($scope.csp) bool = letter.csp == $scope.user.id
            else bool = letter.pic == $scope.user.id
            return bool
        })
    } else {
        $scope.letters = letters
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
    $scope.clients = {}
    clientFactory.getClients({}).then(clients => {
        clients.forEach(client => {
            $scope.clients[client.id] = client.name
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
    $scope.displayRviewed = []
    $scope.displayRevised = []
    $scope.clientReviewedLetters = []
    $scope.clientRevisedLetters = []
    $scope.businessRevisedLetters = []
    $scope.businessReviewedLetters = []
    $scope.Update = []
    if ($scope.user.role !== 4) {
        $scope.Expiring = expiring[0].filter(letter => {
            let bool = true
            if ($scope.user.countries.indexOf(letter.country) === -1) bool = false
            if ($scope.user.customers.indexOf(letter.customer) === -1) bool = false
            if ($scope.csp) bool = letter.csp == $scope.user.id
            else bool = letter.pic == $scope.user.id
            return bool
        })
    } else {
        $scope.Expiring = expiring[0]
    }
    $scope.revisedCustomer = false
    $scope.reviewedCustomer = false
    $scope.$watch('reviewedCustomer', (nv, ov) => {
        if (nv === true) {
            $scope.displayReviewed = $scope.clientReviewedLetters
            console.log(nv, $scope.clientReviewedLetters)
        } else {
            $scope.displayReviewed = $scope.businessReviewedLetters
        }
    })
    $scope.$watch('revisedCustomer', (nv, ov) => {
            if (nv === true) {
                $scope.displayRevised = $scope.clientRevisedLetters
            } else {
                $scope.displayRevised = $scope.businessRevisedLetters
            }
        })
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
            if ($scope.user.role !== 4) {
                $scope.letters = letters.filter(letter => {
                    let bool = true
                    if ($scope.user.countries.indexOf(letter.country) === -1) bool = false
                    if ($scope.user.customers.indexOf(letter.customer) === -1) bool = false
                    if ($scope.csp) bool = letter.csp == $scope.user.id
                    else bool = letter.pic == $scope.user.id
                    return bool
                })
            }
            //set states
            $scope.letters.forEach(letter => {
                $scope[$scope.state[letter.state]].push(letter)
                if (letter.state == 4 && letter.finDoc === 0) $scope.Update.push(letter)
            })
            $scope.clientReviewedLetters = $scope.Reviewed.filter(letter => {
                return letter.client_approved
            })
            $scope.businessReviewedLetters = $scope.Reviewed.filter(letter => {
                return letter.business_approved
            })
            $scope.clientRevisedLetters = $scope.Revised.filter(letter => {
                return letter.client_approved
            })
            $scope.businessRevisedLetters = $scope.Revised.filter(letter => {
                return letter.business_approved
            })
        })
    }
    $rootScope.$on(LETTER_EVENTS.refreshLetters, refreshLetters);
    refreshLetters()
})