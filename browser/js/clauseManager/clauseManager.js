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
            customers: (customerFactory) => {
                return customerFactory.getCustomers({}).then(customers => {
                    return customers
                })
            }
        }
    })
});

app.controller('clauseManagerCtrl', function($scope, countries, countryFactory, clauseFactory, customers, userFactory) {
    $scope.countries = countries
    $scope.customers = customers
    $scope.clauseToBeCreated = {}
    $scope.selectedCountry = $scope.countries[0]
    $scope.selectedCustomer = $scope.customers[0]
    $scope.search = () => {
        clauseFactory.getClauses({
            country: $scope.selectedCountry.id,
            customer: $scope.selectedCustomer.id
        }).then(clauses => {
            $scope.clauses = clauses
        })
    }
    $scope.createClause = (clause) => {
        clause.customer = $scope.selectedCustomer.id
        clause.country = $scope.selectedCountry.id
        clauseFactory.createClause(clause).then(createdClause => {
            $scope.clauses.push(createdClause)
        })
    }
    $scope.deleteClause = (clauseId, index) => {
        $scope.clauses.splice(index, 1)
        clauseFactory.deleteClause({
            id: clauseId
        }).then(clauses => {
            $scope.clauses = clauses
        })
    }
    $scope.toggleNew = () => {
        if (!$scope.selectedCountry || !$scope.selectedCustomer) return
        $scope.newClause = !$scope.newClause
    }
});