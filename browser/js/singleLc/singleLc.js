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

app.controller('singleLcCtrl', ($scope, lcFactory, letter, user, $state) => {
    $scope.user = user
    $scope.letter = letter

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
        /*                
            {
            ammendments:{
            swift: number,
            reference:text,
            previousReferences:[text],
            status:'00'
            }
        }*/
    $scope.amendments = jQuery.extend(true, {}, $scope.letter.amendments)
    $scope.client = $scope.user.role === 0
    for (let key of Object.keys($scope.amendments)) {
        if ($scope.client) {
            $scope.amendments[key].status = $scope.amendments[key].status[0]
        } else $scope.amendments[key].status = $scope.amendments[key].status[1]
    }
    $scope.approveAmendment = (key) => {
        $scope.approved.content[key] = $scope.amendments[key].reference
        $scope.amendments[key].status = '1'
        $scope.approved.length++

    }
    $scope.editAmendment = (key) => {
        console.log(key)
        $scope.amendments[key].previousReferences.push($scope.amendments[key].reference)
        $scope.amendments[key].reference = $scope.reference[key]
        $scope.amendments[key].status = '2'
        $scope.amendments[key].expanded = false
        $scope.amended[$scope.amendments[key]] = $scope.reference[key]
        $scope.reference[key] = ""
        $scope.amended.length++

    }
    $scope.updateLetter = () => {
        var total = $scope.approved.length + $scope.amended.length
        console.log(Object.keys($scope.amendments).length, total)
        if (total !== Object.keys($scope.amendments).length) return

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
                $scope.letter.state++
            }
            if ($scope.client) {
                $scope.letter.approved = "1" + $scope.letter.approved[1]
            } else {
                $scope.letter.approved = $scope.letter.approved[0] + "1"
            }
            if ($scope.letter.approved === "11") $scope.letter.state = 4
        } else {
            $scope.letter.state = 3
            if ($scope.client) {
                $scope.letter.approved = "10"
            } else {
                $scope.letter.approved = "01"
            }
        }

        console.log($scope.letter)
        lcFactory.updateLetter($scope.letter).then(letter => {
            $state.go('listManager.' + $scope.states[letter.state])
        })
    }
    $scope.submitDraft = () => {
        $scope.letter.draft = true

    }
});