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

app.controller('singleLcCtrl', ($scope, lcFactory, letter, user, $state, $rootScope, LETTER_EVENTS, clauseFactory) => {
    $scope.user = user
    $scope.letter = letter
    clauseFactory.getClauses({
        country: $scope.letter.country,
        customer: $scope.letter.client

    }).then(clauses => {
        $scope.clauses = clauses
    })
    $scope.client = $scope.user.role === 0
    if ($scope.client) $scope.notes = jQuery.extend(true, {}, $scope.letter.commercial_notes)
    else $scope.notes = $scope.amendments = jQuery.extend(true, {}, $scope.letter.business_notes)
    console.log($scope.notes)
    $scope.states = {
        1: 'newLcs',
        2: 'reviewed',
        3: 'amended',
        4: 'frozen',
        5: 'archived'
    }
    $scope.approved = 0
    $scope.amended = 0
    $scope.references = {}
    $scope.approveAmendment = (clause) => {
        clause.status = 1
        $scope.notes[clause.swift_code] = clause
        $scope.approved++

    }
    $scope.editAmendment = (clause) => {
        console.log(clause)
        clause.status = 2
        $scope.notes[clause.swift_key] = clause
        $scope.amended++
    }
    $scope.updateLetter = () => {
        var total = $scope.approved + $scope.amended
        if ($scope.letter.clause.length !== total) return
        $scope.letter.draft = false

        for (let key of Object.keys($scope.notes)) {
            if ($scope.client) $scope.commercial_notes = $scope.notes
            else $scope.business_notes = $scope.notes
        }
        if ($scope.approved.length === total) {
            if ($scope.client) {
                $scope.letter.client_approved = true
            } else {
                $scope.letter.business_approved = true
            }
            if ($scope.letter.state === 1) {
                $scope.letter.state = 2
            }
            if ($scope.letter.client_approved && $scope.letter.business_approved) {
                $scope.letter.state = 4
            }
        } else {
            $scope.letter.state = 3
            $scope.letter.business_approved = false
            $scope.letter.client_approved = false
            $scope.letter.amendedCount++
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