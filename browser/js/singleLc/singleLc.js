app.config(function($stateProvider) {
    $stateProvider.state('singleLc', {
        templateUrl: 'js/singleLc/singleLc.html',
        controller: 'singleLcCtrl',
        url: '/lc/:lcNumber',
        data: {
            authenticate: true
        },
        resolve: {
            letter: (lcFactory, $stateParams) => {
                return lcFactory.getSingleLetter($stateParams.lcNumber).then(letter => {
                    return letter
                })
            }
        }
    })
});

app.controller('singleLcCtrl', ($scope, lcFactory, letter) => {
    $scope.letter = letter
    $scope.approved = {
        content: {},
        length: 0
    }
    $scope.amended = {
        content: {},
        length: 0
    }
    $scope.rejected = {
        content: {},
        length: 0
    }
    $scope.reference = {}
    $scope.letter.amendments = {
        20: {
            reference: 'Bridge sentient city boy meta-camera footage DIY papier-mache sign concrete human shoes courier. Dead digital 3D-printed range-rover computer sensory sentient franchise bridge network market rebar tank-traps free-market human. BASE jump stimulate artisanal narrative corrupted assault range-rover film nano-paranoid shrine semiotics convenience store. Sprawl concrete corrupted modem spook human disposable towards narrative industrial grade girl realism weathered Tokyo savant.',
            status: '00',
            lastModified: Date.now()
        },
        22: {
            reference: 'Grenade lights computer saturation point cyber-long-chain hydrocarbons film tattoo skyscraper Tokyo digital into fluidity free-market towards pistol. Katana assault assassin footage cyber-kanji network industrial grade. Corrupted neural realism courier-ware sensory bicycle girl decay face forwards. Concrete towards cardboard DIY modem network monofilament tank-traps ablative urban spook disposable knife bicycle shanty town woman. ',
            status: '00',
            lastModified: Date.now()
        }
    }
    $scope.amendments = jQuery.extend(true, {}, $scope.letter.amendments)
    $scope.client = $scope.user === 3
    for (let key of Object.keys($scope.amendments)) {
        if ($scope.client) {
            $scope.amendments[key].status = $scope.amendments[key].status[0]
        } else $scope.amendments[key].status = $scope.amendments[key].status[1]
    }

    $scope.states = {
        1: 'newLcs',
        2: 'reviewed',
        3: 'amended',
        4: 'frozen',
        5: 'archived'
    }
    $scope.approveAmendment = (key) => {
        $scope.approved.content[key] = $scope.amendments[key].reference
        $scope.amendments[key].status = '1'
        $scope.approved.length++

    }
    $scope.rejectAmendment = (key) => {
        $scope.rejected.content[key] = $scope.amendments[key].reference
        $scope.amendments[key].status = '3'
        $scope.rejected.length++
    }
    $scope.editAmendment = (key) => {
        $scope.amendments[key].reference = $scope.reference[key]
        $scope.amendments[key].status = '2'
        $scope.amendments[key].expanded = false
        $scope.amended[$scope.amendments[key]] = $scope.reference[key]
        $scope.ammended = Object.keys($scope.amended).length
        $scope.reference[key] = ""
    }
    $scope.updateLetter = () => {
        var total = $scope.approved.length + $scope.rejected.length + $scope.amended.length
        if (total !== Object.keys($scope.amendments).length) return

        for (let key of Object.keys($scope.approved.content)) {
            if ($scope.client) $scope.amendments[key].status = '1' + $scope.letter.amendments[key].status[1]
            else $scope.amendments[key].status = $scope.letter.amendments[key].status[0] + '1'
        }
        for (let key of Object.keys($scope.amended.content)) {
            if ($scope.client) $scope.amendments[key].status = '10'
            else $scope.amendments[key].status = '01'
        }
        for (let key of Object.keys($scope.rejected.content)) {
            if ($scope.client) $scope.amendments[key].status = '3' + $scope.letter.amendments[key].status[1]
            else $scope.amendments[key].status = $scope.letter.amendments[key].status[0] + '3'
        }
        $scope.letter.amendments = $scope.amendments
        if ($scope.approved.length === total) {
            if ($scope.client) {
                if ($scope.letter.approved === '01') {
                    $scope.letter.state++
                        $scope.letter.approved = '00'
                } else {
                    $scope.letter.approved = '10'
                }
            } else {
                if ($scope.letter.approved === '10') {
                    $scope.letter.state++
                        $scope.letter.approved === '00'
                } else {
                    $scope.letter.approved = '01'
                }
            }
        }

        lcFactory.updateLetter($scope.letter).then(letter => {
            $state.go($scope.states[letter.state])
        })
    }
    $scope.submitDraft = () => {
        // $scope.client ? $scope.drafts

    }
});