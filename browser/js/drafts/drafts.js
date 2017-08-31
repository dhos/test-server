app.config(function($stateProvider) {
    $stateProvider.state('drafts', {
        templateUrl: 'js/drafts/drafts.html',
        controller: 'draftsCtrl',
        url: '/drafts',
        resolve: {
            draftsdLetters: (lcFactory) => {
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
    $scope.letters = drafts

});