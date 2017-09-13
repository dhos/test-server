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

app.controller('draftsCtrl', function($scope, drafts) {
    $scope.displayLetters = drafts
    $scope.transition = (lc_number) => {
        $state.go('singleLc', {
            lc_number: lc_number
        })
    }
});