app.config(function($stateProvider) {
    $stateProvider.state('createLc', {
        templateUrl: 'js/createLc/createLc.html',
        controller: 'createLcCtrl',
        url: '/createLc'
    })
});

app.controller('createLcCtrl', function($scope, lcFactory, countryFactory, userFactory, bankFactory, $state, LETTER_EVENTS, $rootScope, customerFactory, openModal, clientFactory) {

    $scope.createLc = () => {
        if (!$scope.file) {
            openModal('Please attach an LC', 'There is no lc attached', 'warning', 'warning')
            return
        }
        openModal('Create LC', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {
                $scope.letter.state = 1
                lcFactory.createLetter($scope.letter, $scope.file).then(letter => {
                    $state.go('singleLc', {
                        lc_number: letter.lc_number
                    })
                }).catch(err => {
                    openModal('Upload Error', 'That LC already exists', 'warning', 'warning')
                })
            }
        })
    }

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
            role: 1,
            manager: false
        }).then(picUsers => {
            $scope.picUsers = picUsers
        })
        //get cspusers
    userFactory.getUsers({
            role: 2,
            manager: false
        }).then(cspUsers => {
            $scope.cspUsers = cspUsers
        })
        //getclient
    customerFactory.getCustomers({}).then(customers => {
        $scope.customers = customers
    })

    clientFactory.getAllClients().then(clients => {
        $scope.clients = clients
    })
    $scope.state = {
            1: 'New',
            2: 'Reviewed',
            3: 'Amended',
            4: 'Frozen',
            5: 'Revised'
        }
        // var refreshLetters = () => {
        //     lcFactory.getLetters({}).then(letters => {
        //         $scope.letters = letters
        //         $scope.New = []
        //         $scope.Reviewed = []
        //         $scope.Amended = []
        //         $scope.Frozen = []
        //         $scope.Revised = []
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

});