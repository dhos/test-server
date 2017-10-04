app.config(function($stateProvider) {
    $stateProvider.state('amendLc', {
        templateUrl: 'js/amendLc/amendLc.html',
        controller: 'amendLcCtrl',
        url: '/amend/:lc_number',
        resolve: {
            letter: (lcFactory, $stateParams) => {
                return lcFactory.getSingleLetter($stateParams.lc_number).then(letter => {
                    return letter
                })
            }
        }
    })
});

app.controller('amendLcCtrl', ($scope, lcFactory, countryFactory, userFactory, bankFactory, letter, $state, LETTER_EVENTS, $rootScope, customerFactory, openModal, clientFactory) => {
    //get banks
    bankFactory.getBanks({}).then(banks => {
            $scope.banks = banks
        })
        //get countries
    countryFactory.getCountries({}).then(countries => {
            $scope.countries = countries
        })
        //get picusers
    userFactory.getUsers({
            role: 1
        }).then(picUsers => {
            $scope.picUsers = picUsers
        })
        //get cspusers
    userFactory.getUsers({
            role: 2
        }).then(cspUsers => {
            $scope.cspUsers = cspUsers
        })
        //get clients
    customerFactory.getCustomers({}).then(customers => {
        $scope.customers = customers
    })
    clientFactory.getAllClients().then(clients => {
        $scope.clients = clients
    })
    $scope.letter = letter
    $scope.updateLc = () => {
        openModal('Amend LC', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {
                if ($scope.updatedFile) {
                    if ($scope.letter.state === 4) {
                        openModal('Frozen', 'Please unfreeze the lc before editing', 'warning', 'warning')
                        return
                    }

                    $scope.letter.state = 5
                    $scope.letter.business_approved = false
                    $scope.letter.client_approved = false
                    $scope.letter.commercial_notes = {}
                    $scope.letter.business_notes = {}
                    lcFactory.updateLetterFile($scope.letter, $scope.updatedFile).then(letter => {
                        $state.go('singleLc', {
                            lc_number: letter.lc_number
                        })
                    })
                } else {
                    lcFactory.updateLetter($scope.letter).then(letter => {
                        $state.go('singleLc', {
                            lc_number: letter.lc_number
                        })
                    })
                }
            }
        })
    }


    $scope.state = {
            1: 'New',
            2: 'Reviewed',
            3: 'Amended',
            4: 'Frozen',
            5: 'Pending Update'
        }
        // var refreshLetters = () => {
        //     lcFactory.getLetters({}).then(letters => {
        //         $scope.letters = letters
        //         $scope.New = []
        //         $scope.Reviewed = []
        //         $scope.Amended = []
        //         $scope.Frozen = []
        //         $scope.Update = []
        //         $scope.letters = letters
        //             //set states
        //         $scope.letters.forEach(letter => {
        //             $scope[$scope.state[letter.state]].push(letter)
        //         })
        //         $scope.Frozen.forEach(frozen => {
        //             if (frozen.finDoc === 0) $scope.Update.push(frozen)
        //         })
        //     })
        //     lcFactory.getExpiringLetters({}).then(expiring => {
        //         $scope.Expiring = expiring[0]
        //     })
        // }
        // $rootScope.$on(LETTER_EVENTS.refreshLetters, refreshLetters);

    // refreshLetters();

})