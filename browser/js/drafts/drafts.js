app.config(function($stateProvider) {
    $stateProvider.state('listManager.drafts', {
        templateUrl: 'js/drafts/drafts.html',
        controller: 'draftsCtrl',
        url: '/drafts',
        resolve: {}
    })
});

app.controller('draftsCtrl', function($scope, $state, lcFactory) {
    console.log($scope.user)
        // lcFactory.getLetters()
    if ($scope.user.role === 1 && !$scope.user.manager) {
        $scope.displayLetters = $scope.letters.filter(letter => {
            return letter.business_draft
        })
    }
    if ($scope.user.role === 2 && !$scope.user.manager) {
        $scope.displayLetters = $scope.letters.filter(letter => {
            return letter.client_draft
        })
    }
    $scope.transition = (lcNumber) => {
        $state.go('singleLc', {
            lc_number: lcNumber
        })
    }
});