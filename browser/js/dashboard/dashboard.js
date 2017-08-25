app.config(function($stateProvider) {
    $stateProvider.state('dashboard', {
        templateUrl: 'js/dashboard/dashboard.html',
        controller: 'dashboardCtrl',
        url: '/dashboard',
        data: {
            authenticate: true
        },
        resolve: {
            // letters: (lcFactory) => {
            //     return lcFactory.getLetters({}).then(letters => {
            //         return letters
            //     })
            // }
        }
    })
});

app.controller('dashboardCtrl', function($scope, $state, lcFactory) {

    //inits
    // $scope.letters = letters
    //$scope.analytics = analytics

    //end inits
    $scope.letter = {
        lc_number: 34534535,
        uploads: ['SGHSBC7G18301634-T01.pdf'],
        ammendments: {
            20: 'Bridge sentient city boy meta-camera footage DIY papier-mache sign concrete human shoes courier. Dead digital 3D-printed range-rover computer sensory sentient franchise bridge network market rebar tank-traps free-market human. BASE jump stimulate artisanal narrative corrupted assault range-rover film nano-paranoid shrine semiotics convenience store. Sprawl concrete corrupted modem spook human disposable towards narrative industrial grade girl realism weathered Tokyo savant.',
            22: 'Grenade lights computer saturation point cyber-long-chain hydrocarbons film tattoo skyscraper Tokyo digital into fluidity free-market towards pistol. Katana assault assassin footage cyber-kanji network industrial grade. Corrupted neural realism courier-ware sensory bicycle girl decay face forwards. Concrete towards cardboard DIY modem network monofilament tank-traps ablative urban spook disposable knife bicycle shanty town woman. '
        },
        date: Date.now(),
        country: 1,
        client: 1,
        bank: 'Bank of China',
        psr: 'Sharon',
        crc: 'Bob',
        state: 5,
        draft: false,
        finDoc: 0,
        finDate: null

    }
    $scope.test = () => {

    }

    //functions to edit and ammend lcs
    $scope.createLc = (letterToBeCreated) => {
        lcFactory.createLetter(letterToBeCreated).then(createdLetter => {
            $state.go('listManager')
        })
    }

    $scope.addLcAttachment = (fileToBeAdded, lcId) => {
        lcFactory.updateLetterFile(fileToBeAdded, lcId).then(letter => {
            $state.go()
        })
    }

    $scope.setLcToAmmended = (letterToBeUpdated) => {
        letterToBeUpdated.status = 3
        lcFactory.updateLetter(letterToBeUpdated).then(response => {
            $state.go('amended')
        })
    }

    $scope.setLcToReviewed = (letterToBeUpdated) => {
        letterToBeUpdated.status = 2
        lcFactory.updateLetter(letterToBeUpdated).then(response => {
            $state.go('review')
        })
    }

    $scope.setLcToFrozen = (letterToBeUpdated) => {
        letterToBeUpdated.status = 4
        lcFactory.updateLetter(letterToBeUpdated).then(response => {
            $state.go('frozen')
        })

    }

    $scope.setLcToArchived = (letterToBeUpdated) => {
        letterToBeUpdated.finDoc = $scope.finDoc
        letterToBeUpdated.status = 5
        lcFactory.updateLetter(letterToBeUpdated).then(response => {
            $state.go('archived')
        })

    }

    /*ammendments = [{
        swiftCode:int,
        reference: text,
        status: 0,1,2,
        dateModified:date  
    }]
    */

});