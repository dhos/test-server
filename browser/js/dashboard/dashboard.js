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
            },
            archivedLetters: (lcFactory) => {
                return lcFactory.getArchivedLetters({
                    offset: 0
                }).then(archived => {
                    return archived
                })
            },
            banks: (bankFactory) => {
                return bankFactory.getBanks({}).then(banks => {
                    return banks
                })
            },
            csps: (userFactory) => {
                return userFactory.getUsers({
                    role: 2
                }).then(cspUsers => {
                    return cspUsers.filter(user => {
                        return !user.manager
                    })
                })
            },
            countries: (countryFactory) => {
                return countryFactory.getCountries({}).then(countries => {
                    return countries
                })
            }
        }
    })
});

app.controller('dashboardCtrl', function($scope, $state, lcFactory, letters, countries, userFactory, expiring, user, customerFactory, archivedLetters, bankFactory, banks, csps) {
    jQuery('body').removeClass('loginpage')
    $scope.user = user
    $scope.archivedCount = archivedLetters.count
    $scope.Archived = archivedLetters.rows
    $scope.csp = $scope.user.role === 2
    $scope.pic = $scope.user.role === 1
    $scope.manager = $scope.user.manager
    if ($scope.user.role !== 4) {
        $scope.letters = letters.filter(letter => {
            let bool = true
            if ($scope.user.countries.indexOf(letter.country) === -1) bool = false
            if ($scope.user.customers.indexOf(letter.customer) === -1) bool = false
            if (!$scope.user.manager) {
                if ($scope.csp) bool = letter.csp == $scope.user.id
                else bool = letter.pic == $scope.user.id
            }
            return bool
        })
    } else {
        $scope.letters = letters
    }
    $scope.countries = {}
    $scope.countryCharts = {}
    countries.forEach(country => {
        $scope.countries[country.id] = country.name
        $scope.countryCharts[country.id] = country
        $scope.countryCharts[country.id].lcCount = 0

    })

    $scope.customers = {}
    customerFactory.getCustomers({}).then(customers => {
        customers.forEach(customer => {
            $scope.customers[customer.id] = customer.name
        })
    })
    $scope.banks = {}
    banks.forEach(bank => {
        $scope.banks[bank.id] = bank
        $scope.banks[bank.id].lcCount = 0
    })
    $scope.csps = {}
    csps.forEach(csp => {
        $scope.csps[csp.id] = csp
        $scope.csps[csp.id].lcCount = 0
    })
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Revised'
    }
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
    if ($scope.user.role !== 4) {
        $scope.Expiring = expiring[0].filter(letter => {
            let bool = true
            if ($scope.user.countries.indexOf(letter.country) === -1) bool = false
            if ($scope.user.customers.indexOf(letter.customer) === -1) bool = false
            if ($scope.csp && !$scope.manager) bool = letter.csp == $scope.user.id
            if ($scope.pic && !$scope.manager) bool = letter.pic == $scope.user.id
            return bool
        })
    } else {
        $scope.Expiring = expiring[0]
    }
    $scope.thisMonth = 0
    $scope.lastMonth = 0
    $scope.reset = (letters) => {
        $scope.New = []
        $scope.Reviewed = []
        $scope.Amended = []
        $scope.Frozen = []
        $scope.Update = []
        $scope.Revised = []
        $scope.revisedCustomer = 0
        $scope.revisedElite = 0
        $scope.reviewedCustomer = 0
        $scope.reviewedElite = 0
        if ($scope.user.role !== 4) {
            $scope.Expiring = expiring[0].filter(letter => {
                let bool = true
                if ($scope.user.countries.indexOf(letter.country) === -1) bool = false
                if ($scope.user.customers.indexOf(letter.customer) === -1) bool = false
                if ($scope.csp && !$scope.manager) bool = letter.csp == $scope.user.id
                if ($scope.pic && !$scope.manager) bool = letter.pic == $scope.user.id
                return bool
            })
        } else {
            $scope.Expiring = expiring[0]
        }
        //set states

        letters.forEach(letter => {
            $scope[$scope.state[letter.state]].push(letter)
            $scope.banks[letter.bank].lcCount += 1
            let date = moment.utc(letter.createdAt, 'YYYY-MM-DD');
            if (isThisMonth(date)) {
                $scope.thisMonth += 1
            }
            if (isLastMonth(date)) {
                $scope.lastMonth += 1
            }
            if (letter.csp !== null) $scope.csps[letter.csp].lcCount += 1
            if (letter.country !== null) $scope.countryCharts[letter.country].lcCount += 1
        })

        // $scope.Amended.forEach
        $scope.Frozen.forEach(frozen => {
            if (frozen.finDoc === 0) $scope.Update.push(frozen)
        })
        $scope.Revised.forEach(revised => {
            if (jQuery.isEmptyObject(revised.commercial_notes)) $scope.revisedCustomer += 1
            if (jQuery.isEmptyObject(revised.business_notes)) $scope.revisedElite += 1
        })
        $scope.Reviewed.forEach(reviewed => {
            if (jQuery.isEmptyObject(reviewed.client_notes)) $scope.reviewedCustomer += 1
            if (jQuery.isEmptyObject(reviewed.business_notes)) $scope.reviewedElite += 1
        })
    }
    $scope.filter = () => {
        $scope.New = []
        $scope.Reviewed = []
        $scope.Amended = []
        $scope.Frozen = []
        $scope.Update = []
        $scope.Revised = []
        $scope.revisedCustomer = 0
        $scope.revisedElite = 0
        $scope.reviewedCustomer = 0
        $scope.reviewedElite = 0
        $scope.filteredLetters = []
        if ($scope.customerFilter.name !== "All") {
            if ($scope.countryFilter.name !== "All") {
                $scope.filteredLetters = $scope.letters.filter(letter => {
                    return (letter.customer == $scope.customerFilter.filter) && (letter.country == $scope.countryFilter.filter)
                })
                $scope.Expiring = $scope.Expiring.filter(letter => {
                    return (letter.customer == $scope.customerFilter.filter) && (letter.country == $scope.countryFilter.filter)
                })
                $scope.Archived = $scope.Archived.filter(letter => {
                    return (letter.customer == $scope.customerFilter.filter) && (letter.country == $scope.countryFilter.filter)
                })
            } else {
                $scope.filteredLetters = $scope.letters.filter(letter => {
                    return letter.customer == $scope.customerFilter.filter
                })
                $scope.Expiring = $scope.Expiring.filter(letter => {
                    return letter.customer == $scope.customerFilter.filter
                })
                $scope.Archived = $scope.Archived.filter(letter => {
                    return letter.customer == $scope.customerFilter.filter
                })
            }
        } else {
            if ($scope.countryFilter.name !== "All") {
                $scope.filteredLetters = $scope.letters.filter(letter => {
                    return letter.country == $scope.countryFilter.filter
                })
                $scope.Expiring = $scope.Expiring.filter(letter => {
                    return letter.country == $scope.countryFilter.filter
                })
                $scope.Archived = $scope.Archived.filter(letter => {
                    return letter.country == $scope.countryFilter.filter
                })
            } else {
                $scope.filteredLetters = $scope.letters
                $scope.Expiring = expiring[0]
                $scope.Archived = archivedLetters.rows
            }
        }
        $scope.filteredLetters.forEach(letter => {
                $scope[$scope.state[letter.state]].push(letter)
            })
            // $scope.Amended.forEach
        $scope.Frozen.forEach(frozen => {
            if (frozen.finDoc === 0) $scope.Update.push(frozen)
        })
        $scope.Revised.forEach(revised => {
            if (jQuery.isEmptyObject(revised.commercial_notes)) $scope.revisedCustomer += 1
            if (jQuery.isEmptyObject(revised.business_notes)) $scope.revisedElite += 1
        })
        $scope.Reviewed.forEach(reviewed => {
            if (jQuery.isEmptyObject(reviewed.client_notes)) $scope.reviewedCustomer += 1
            if (jQuery.isEmptyObject(reviewed.business_notes)) $scope.reviewedElite += 1
        })

    }
    let isThisMonth = (lc) => {
        let thisMonth = [moment.utc().startOf('month'), moment.utc().endOf('month')]
        return lc.isBetween(thisMonth[0], thisMonth[1]) || lc.isSame(thisMonth[0]) || lc.isSame(thisMonth[1])
    }
    let isLastMonth = (lc) => {
        let lastMonth = [moment.utc().subtract(1, 'months').startOf('month'), moment.utc().subtract(1, 'months').endOf('month')]
        return lc.isBetween(lastMonth[0], lastMonth[1]) || lc.isSame(lastMonth[0]) || lc.isSame(lastMonth[1])
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

    //functions to edit and ammend lcs
    //monthly lcs this month last month
    //ask if it's strictly this month or in the past 30 days
    //this can all be done within the single loop in the reset function
    //lc by bankbanks to create a bar graph
    //lc by cspl
    //lc by timeline


});