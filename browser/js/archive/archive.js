app.config(function($stateProvider) {
    $stateProvider.state('archive', {
        templateUrl: 'js/archive/archive.html',
        controller: 'archiveCtrl',
        url: '/archive',
        resolve: {
            archivedLetters: (lcFactory) => {
                return lcFactory.getLetters({
                    archived: true
                }).then(archived => {
                    return archived
                })
            }
        }
    })
});

app.controller('archiveCtrl', function($scope, archived) {
    $scope.letters = archived

});