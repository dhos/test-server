app.config(function($stateProvider) {
    $stateProvider.state('singleLc', {
        templateUrl: 'js/singleLc/singleLc.html',
        controller: 'singleLcCtrl',
        url: '/lc/:lc_number',
        data: {
            authenticate: true
        },
        resolve: {
            letter: (lcFactory, $stateParams, $state) => {
                return lcFactory.getSingleLetter($stateParams.lc_number).then(letter => {
                    if (!letter) $state.go('listManager.all')
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

app.controller('singleLcCtrl', ($scope, lcFactory, letter, user, $state, $rootScope, LETTER_EVENTS, clauseFactory, openModal, clientFactory) => {
    $scope.user = user
    $scope.letter = letter
    $scope.client = $scope.user.role === 2
    $scope.owner = $scope.client ? ($scope.letter.csp == $scope.user.id) : ($scope.letter.pic == $scope.user.id)
    $scope.manager = $scope.user.manager
    $scope.approved = []
    $scope.amended = []
    clientFactory.getSingleClient($scope.letter.client).then(client => {
        $scope.letterClient = client
        console.log($scope.letterClinet)
    })

    clauseFactory.getClauses({
        country: $scope.letter.country,
        customer: $scope.letter.customer
    }).then(clauses => {
        $scope.clauses = clauses.map(clause => {
            if (clause.commercial) {
                if ($scope.letter.commercial_notes[clause.swift_code]) clause = $scope.letter.commercial_notes[clause.swift_code]

            } else {
                if ($scope.letter.business_notes[clause.swift_code]) clause = $scope.letter.business_notes[clause.swift_code]
            }

            return clause
        })
        $scope.business_clauses = $scope.clauses.filter(clause => {
            return clause.commercial == false
        })
        $scope.commercial_clauses = $scope.clauses.filter(clause => {
            return clause.commercial == true
        })
        if (!$scope.client) {
            $scope.business_clauses.forEach(clause => {
                if (clause.status == 1) $scope.approved.push(clause.swift_code)
                else if (clause.status == 2) $scope.amended.push(clause.swift_code)
            })
        } else {
            $scope.commercial_clauses.forEach(clause => {
                if (clause.status == 1) $scope.approved.push(clause.swift_code)
                else if (clause.status == 2) $scope.amended.push(clause.swift_code)
            })
        }
    })


    $scope.states = {
        1: 'newLcs',
        2: 'reviewed',
        3: 'amended',
        4: 'frozen',
        5: 'revised'
    }
    let checkPermissions = (commercial) => {
        return ($scope.client ? !!commercial : !commercial) && (!$scope.manager) && ($scope.owner)
    }

    let noPermission = () => {
        return openModal('No Access', 'You don\'t have access to that', '', 'warning')
    }

    $scope.approve = clause => {
        if (!checkPermissions(clause.commercial)) return noPermission()
        clause.expanded = false
        clause.status = 1
        $scope.approved.push(clause.swift_code)
    }
    $scope.unapprove = clause => {
        if (!checkPermissions(clause.commercial)) return noPermission()
        clause.status = null
        $scope.approved.splice($scope.approved.indexOf(clause.swift_code), 1)

    }
    $scope.ammend = clause => {
        if (!checkPermissions(clause.commercial)) return noPermission()
        clause.status = 2
        clause.expanded = false
        if ($scope.amended.indexOf(clause.swift_code) === -1) {
            $scope.amended.push(clause.swift_code)
        }
    }
    $scope.unammend = clause => {
        if (clause.expanded == false) clause.expanded = true
        else {
            if (!checkPermissions(clause.commercial)) return noPermission()
            openModal('Delete Note', 'Are you sure you want to remove the note?', 'prompt', 'confirm').then(result => {
                if (!result) return
                clause.status = null
                clause.note = null
                $scope.amended.splice($scope.amended.indexOf(clause.swift_code), 1)
            })
        }
    }
    $scope.freeze = () => {
        if ($scope.letter.state === 4) {
            $scope.letter.state = 5
            $scope.letter.business_notes = {}
            $scope.letter.commercial_notes = {}
            $scope.letter.client_approved = false
            $scope.letter.business_approved = false
        } else $scope.letter.state = 4
        lcFactory.updateLetter($scope.letter).then(letter => {
            $state.go("listManager.all")
        })
    }
    $scope.updateLetter = () => {
        var approved = true
        var complete = true
        if (!$scope.client) {
            $scope.business_clauses.forEach(clause => {
                if (!clause.status) {
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
        if (!complete) return openModal('Incomplete', 'There are clauses awaiting approval', '', 'warning')
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

    $scope.$on('$destroy', function() {

    })
});