app.config(function($stateProvider) {
    $stateProvider.state('dashboard', {
        templateUrl: 'js/dashboard/dashboard.html',
        controller: 'dashboardCtrl',
        url: '/dashboard',
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
                return lcFactory.getExpiringLetters().then(expiring => {
                    return expiring
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

app.controller('dashboardCtrl', function($scope, $state, lcFactory, letters, countryFactory, userFactory, expiring, user, customerFactory) {
    $scope.user = user
    $scope.csp = $scope.user.role === 2
    if ($scope.user.role !== 4) {
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
    $scope.countries = {}
    countryFactory.getCountries({}).then(countries => {
        countries.forEach(country => {
            $scope.countries[country.id] = country.name
        })
    })
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
    $scope.Archived = []
    $scope.countryFilter = {
        name: "All"
    }
    $scope.customerFilter = {
        name: "All"
    }

    $scope.allCountries = () => {
        $scope.countryFilter = {
            name: "All"
        }
        $scope.filter()
    }
    $scope.allCustomers = () => {
        $scope.customerFilter = {
            name: "All"
        }
        $scope.filter()
    }
    if (scope.user.role !== 4) {
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

    $scope.reset = (letters) => {
        $scope.New = []
        $scope.Reviewed = []
        $scope.Amended = []
        $scope.Frozen = []
        $scope.Update = []
        $scope.Revised = []
        $scope.amendedCustomer = 0
        $scope.amendedElite = 0
        $scope.reviewedCustomer = 0
        $scope.reviewedElite = 0
        if (scope.user.role !== 4) {
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
        //set states
        letters.forEach(letter => {
                $scope[$scope.state[letter.state]].push(letter)
            })
            // $scope.Amended.forEach
        $scope.Frozen.forEach(frozen => {
            if (frozen.finDoc === 0) $scope.Update.push(frozen)
        })
        $scope.Amended = $scope.Amended.concat($scope.Revised)
        $scope.Amended.forEach(amended => {
            if (!amended.clientApproved) $scope.amendedCustomer += 1
            if (!amended.business_approved) $scope.amendedElite += 1
        })
        $scope.Reviewed.forEach(reviewed => {
            if (!reviewed.clientApproved) $scope.reviewedCustomer += 1
            if (!reviewed.business_approved) $scope.reviewedElite += 1
        })
    }
    $scope.filter = () => {
        $scope.New = []
        $scope.Reviewed = []
        $scope.Amended = []
        $scope.Frozen = []
        $scope.Update = []
        $scope.Revised = []
        $scope.amendedCustomer = 0
        $scope.amendedElite = 0
        $scope.reviewedCustomer = 0
        $scope.reviewedElite = 0
        if ($scope.customerFilter.name !== "All") {
            if ($scope.countryFilter.name !== "All") {
                var letters = $scope.letters.filter(letter => {
                    return letter.customer == $scope.customerFilter.filter && letter.country == $scope.countryFilter.filter
                })
                $scope.Expiring = $scope.expiringLetters.filter(letter => {
                    return letter.customer == $scope.customerFilter.filter && letter.country == $scope.countryFilter.filter
                })
            } else {
                var letters = $scope.letters.filter(letter => {
                    return letter.customer == $scope.customerFilter.filter
                })
                $scope.Expiring = $scope.expiringLetters.filter(letter => {
                    return letter.customer == $scope.customerFilter.filter
                })
            }
        } else {
            if ($scope.countryFilter.name !== "All") {
                var letters = $scope.letters.filter(letter => {
                    return letter.country == $scope.countryFilter.filter
                })
                $scope.Expiring = $scope.expiringLetters.filter(letter => {
                    return letter.country == $scope.countryFilter.filter
                })
            } else {
                var letters = $scope.letters
                $scope.Expiring = $scope.expiringLetters
            }
        }
        letters.forEach(letter => {
                $scope[$scope.state[letter.state]].push(letter)
            })
            // $scope.Amended.forEach
        $scope.Frozen.forEach(frozen => {
            if (frozen.finDoc === 0) $scope.Update.push(frozen)
        })
        $scope.Amended = $scope.Amended.concat($scope.Revised)
        $scope.Amended.forEach(amended => {
            if (!amended.clientApproved) $scope.amendedCustomer += 1
            if (!amended.business_approved) $scope.amendedElite += 1
        })
        $scope.Reviewed.forEach(reviewed => {
            console.log(reviewed)
            if (!reviewed.clientApproved) $scope.reviewedCustomer += 1
            if (!reviewed.business_approved) $scope.reviewedElite += 1
        })

    }

    $scope.filterByCustomer = (customerId, name) => {
        $scope.customerFilter = {
            name: name,
            filter: customerId
        }
        $scope.filter()
    }
    $scope.filterByCountry = (countryId, name) => {
        $scope.countryFilter = {
            name: name,
            filter: countryId
        }
        $scope.filter()
    }
    $scope.reset($scope.letters)

    //inits
    // $scope.letters = letters
    //$scope.analytics = analytics

    //end inits

    //functions to edit and ammend lcs


});