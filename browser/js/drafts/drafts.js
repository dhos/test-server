app.config(function($stateProvider) {
    $stateProvider.state('listManager.drafts', {
        templateUrl: 'js/drafts/drafts.html',
        controller: 'draftsCtrl',
        url: '/drafts',
        resolve: {
            drafts: (lcFactory) => {
                return lcFactory.getLetters({
                    draft: true
                }).then(drafts => {
                    return drafts
                })
            }
        }
    })
});

app.controller('draftsCtrl', function($scope, drafts, $state) {
    $scope.displayLetters = drafts
    $scope.transition = (lcNumber) => {
        $state.go('singleLc', {
            lc_number: lcNumber
        })
    }
});