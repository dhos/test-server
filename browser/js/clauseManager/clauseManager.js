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
            }
        }
    })
});

app.controller('clauseManagerCtrl', function($scope, countries, countryFactory) {
    $scope.countries = countries
    $scope.selectedCountry = $scope.countries[0]
    $scope.updateCountries = (country) => {
        countryFactory.updateCountry(country).then(() => {
            countryFactory.getCountries({}).then(countries => {
                $scope.countries = countries
            })
        })
    }
});