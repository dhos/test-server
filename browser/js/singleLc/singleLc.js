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
        // onEnter: (letter, user) => {
        //     if ($scope.user.id !== $scope.letter.client) $state.go('dashboard')
        // }
    })
});

app.controller('singleLcCtrl', ($scope, lcFactory, letter, user, $state, $rootScope, LETTER_EVENTS, clauseFactory) => {
    $scope.user = user
    $scope.letter = letter
    console.log($scope.letter, $scope.user)
    $scope.client = $scope.user.role === 0

    if ($scope.client) $scope.notes = jQuery.extend(true, {}, $scope.letter.commercial_notes)
    else $scope.notes = $scope.amendments = jQuery.extend(true, {}, $scope.letter.business_notes)
    clauseFactory.getClauses({
        country: $scope.letter.country,
        customer: $scope.letter.client
    }).then(clauses => {
        $scope.clauses = clauses
        $scope.business_clauses = $scope.clauses.filter(clause => {
            return clause.commercial == false
        })
        $scope.commercial_clauses = $scope.clauses.filter(clause => {
            return clause.commercial == true
        })
        $scope.clauses.forEach(clause => {
            if ($scope.notes[clause.swift_code]) {
                clause.status = $scope.notes[clause.swift_code].status
                clause.note = $scope.notes[clause.swift_code].note
            }
        })
    })


    $scope.states = {
        1: 'newLcs',
        2: 'reviewed',
        3: 'amended',
        4: 'frozen',
        5: 'revised'
    }
    $scope.approved = 0
    $scope.amended = 0
    let checkPermissions = (commercial) => {
        return $scope.client ? !!commercial : !commercial
    }
    $scope.approve = clause => {
        if (!checkPermissions(clause.commercial)) return
        clause.status = 1
        $scope.approved += 1
    }
    $scope.unapprove = clause => {
        if (!checkPermissions(clause.commercial)) return
        clause.status = null
        $scope.approved -= 1
    }
    $scope.ammend = clause => {
        if (!checkPermissions(clause.commercial)) return
        clause.status = 2
        clause.expanded = false
        $scope.amended += 1
    }
    $scope.unammend = clause => {
        if (!checkPermissions(clause.commercial)) return
        clause.status = null
        clause.note = null
        $scope.amended -= 1
    }
    $scope.updateLetter = () => {
        var approved = true
        var complete = true
        if (!$scope.client) {
            $scope.business_clauses.forEach(clause => {
                if (!clause.status) {
                    console.log(clause)
                    complete = false
                }
                if (clause.status == 2) approved = false
                $scope.letter.business_notes[clause.swift_code] = clause
            })
        } else {
            $scope.commercial_clauses.forEach(clause => {
                if (!clause.status) complete = false
                if (clause.status == 2) approved = false
                $scope.letter.commercial_notes[clause.swift_code] = clause
            })
        }
        $scope.letter.draft = false
        $scope.client ? $scope.letter.client_approved = true : $scope.letter.business_approved = true
        console.log(complete, approved)
        if (!complete) return
        if (approved) {
            if ($scope.letter.state === 1) {
                $scope.letter.state = 2
            }
            if ($scope.letter.client_approved && $scope.letter.business_approved) {
                $scope.letter.state = 4
            }
        } else {
            $scope.letter.state = 3
            $scope.letter.amendedCount += 1
        }
        $scope.client ? $scope.letter.client_approved = true : $scope.letter.business_approved = true

        lcFactory.updateLetter($scope.letter).then(letter => {
            $state.go('listManager.' + $scope.states[letter.state])
        })
    }
    $scope.submitDraft = () => {
        $scope.letter.draft = true
        if (!$scope.client) {
            $scope.business_clauses.forEach(clause => {
                $scope.letter.business_notes[clause.swift_code] = clause
            })
        } else {
            $scope.commercial_clauses.forEach(clause => {
                $scope.letter.commercial_notes[clause.swift_code] = clause
            })
        }
        lcFactory.updateLetter($scope.letter).then(letter => {
            $state.go("listManager.drafts")
        })
    }
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Revised'
    }

    var refreshLetters = () => {
        lcFactory.getLetters({}).then(letters => {
            $scope.letters = letters
            $scope.New = []
            $scope.Reviewed = []
            $scope.Revised = []
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