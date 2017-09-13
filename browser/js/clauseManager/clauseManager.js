app.config(function($stateProvider) {
    $stateProvider.state('clauseManager', {
        templateUrl: 'js/clauseManager/clauseManager.html',
        controller: 'clauseManagerCtrl',
        url: '/clauseManager',
        resolve: {
            countries: (countryFactory) => {
                return countryFactory.getCountries({}).then(countries => {
                    return countries
                })
            },
            clauses: (clauseFactory) => {
                return clauseFactory.getClauses({}).then(clauses => {
                    console.log(clauses)
                    return clauses
                })
            },
            customers: (userFactory) => {
                return userFactory.getUsers({
                    role: 0
                }).then(customers => {
                    return customers
                })
            }
        }
    })
});

app.controller('clauseManagerCtrl', function($scope, countries, countryFactory, clauseFactory, customers, userFactory, clauses) {
    $scope.clauses = clauses
    $scope.countries = countries
    $scope.customers = customers
    $scope.clauseToBeCreated = {}
    $scope.radio = {
        value: 'country'
    };
    $scope.specialValue = {
        "id": "12345",
        "value": "green"
    };
    console.log($scope.country)
    $scope.selectedCountry = $scope.countries[0]
    $scope.selectedCustomer = $scope.customers[0]
    $scope.updateCountries = (country) => {
        countryFactory.updateCountry(country).then(() => {
            countryFactory.getCountries({}).then(countries => {
                $scope.countries = countries
            })
        })
    }
    $scope.createClause = (clause) => {
        console.log($scope.selectedCustomer)
        clauseFactory.createClause(clause).then(createdClause => {
            clauseFactory.getClauses({}).then(clauses => {
                $scope.clauses = clauses
            })
            if ($scope.radio.value == "country") {
                $scope.selectedCountry.clauses.push(createdClause.id - 1)
                countryFactory.updateCountry($scope.selectedCountry).then(country => {
                    countryFactory.getCountries({}).then(countries => {
                        $scope.countries = countries
                        $scope.clauseToBeCreated = {}
                    })
                })
            } else {

                $scope.selectedCustomer.clauses.push(createdClause.id - 1)
                userFactory.updateUser($scope.selectedCustomer).then(user => {
                    userFactory.getUsers({
                        role: 0
                    }).then(customers => {
                        $scope.customers = customser
                        $scope.clauseToBeCreated = {}

                    })
                })
            }
        })
    }
    $scope.toggleNew = () => {
        $scope.newClause = !$scope.newClause
    }
});