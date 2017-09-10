app.config(function($stateProvider) {
    $stateProvider.state('singleLc', {
        templateUrl: 'js/singleLc/singleLc.html',
        controller: 'singleLcCtrl',
        url: '/lc/:lc_number',
        data: {
            authenticate: true
        },
        resolve: {
            letter: (lcFactory, $stateParams) => {
                return lcFactory.getSingleLetter($stateParams.lc_number).then(letter => {
                    return letter
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

app.controller('singleLcCtrl', ($scope, lcFactory, letter, user, $state, $rootScope, LETTER_EVENTS, clauses) => {
    $scope.user = user
    $scope.letter = letter
    $scope.clauses = clauses
    $scope.states = {
        1: 'newLcs',
        2: 'reviewed',
        3: 'amended',
        4: 'frozen',
        5: 'archived'
    }
    $scope.approved = {
        content: {},
        length: 0
    }
    $scope.amended = {
        content: {},
        length: 0
    }
    $scope.reference = {}


    $scope.approveAmendment = (key) => {
        $scope.approved.content[key] = $scope.amendments[key].reference
        $scope.amendments[key].status = '1'
        $scope.approved.length++

    }
    $scope.editAmendment = (key) => {
        $scope.amendments[key].previousReferences.push($scope.amendments[key].reference)
        $scope.amendments[key].reference = $scope.reference[key]
        $scope.amendments[key].status = '2'
        $scope.amendments[key].expanded = false
        $scope.amended.content[key] = $scope.reference[key]
        $scope.reference[key] = ""
        $scope.amended.length++

    }
    $scope.updateLetter = () => {
        var total = $scope.approved.length + $scope.amended.length
        $scope.letter.draft = false
        for (let key of Object.keys($scope.approved.content)) {
            if ($scope.client) $scope.amendments[key].status = '1' + $scope.letter.amendments[key].status[1]
            else $scope.amendments[key].status = $scope.letter.amendments[key].status[0] + '1'
        }
        for (let key of Object.keys($scope.amended.content)) {
            if ($scope.client) $scope.amendments[key].status = '10'
            else $scope.amendments[key].status = '01'
        }

        $scope.letter.amendments = $scope.amendments
        if ($scope.approved.length === total) {
            if ($scope.letter.state === 1) {
                $scope.letter.state = 2
            }
            if ($scope.client) {
                $scope.letter.approved = "1" + $scope.letter.approved[1]
            } else {
                $scope.letter.approved = $scope.letter.approved[0] + "1"
            }
            if ($scope.letter.approved === "11") {
                $scope.letter.state = 4
                $scope.letter.approved = "01"
            }
        } else {
            $scope.letter.state = 3
            $scope.letter.amendedCount++
                if ($scope.client) {
                    $scope.letter.approved = "10"
                } else {
                    $scope.letter.approved = "01"
                }
        }

        lcFactory.updateLetter($scope.letter).then(letter => {
            $state.go('listManager.' + $scope.states[letter.state])
        })
    }
    $scope.submitDraft = () => {
        $scope.letter.draft = true
        for (let key of Object.keys($scope.approved.content)) {
            if ($scope.client) $scope.amendments[key].status = '0' + $scope.letter.amendments[key].status[1]
            else $scope.amendments[key].status = $scope.letter.amendments[key].status[0] + '0'
        }
        for (let key of Object.keys($scope.amended.content)) {
            if ($scope.client) $scope.amendments[key].status = '00'
            else $scope.amendments[key].status = '00'
        }
        $scope.letter.draftText = $scope.amendments
        lcFactory.updateLetter($scope.letter).then(letter => {
            $state.go("listManager.drafts")
        })
    }
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Pending Update'
    }

    var refreshLetters = () => {
        lcFactory.getLetters({}).then(letters => {
            $scope.letters = letters
            $scope.New = []
            $scope.Reviewed = []
            $scope.Amended = []
            $scope.Frozen = []
            $scope.Update = []
            $scope.letters = letters
                //set states
            $scope.letters.forEach(letter => {
                $scope[$scope.state[letter.state]].push(letter)
            })
            $scope.Frozen.forEach(frozen => {
                if (frozen.finDoc === 0) $scope.Update.push(frozen)
            })
        })
        lcFactory.getExpiringLetters({}).then(expiring => {
            $scope.Expiring = expiring[0]
        })
    }
    $rootScope.$on(LETTER_EVENTS.refreshLetters, refreshLetters);

    refreshLetters();
});