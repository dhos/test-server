app.config(function($stateProvider) {
    $stateProvider.state('listManager.archive', {
        templateUrl: 'js/archive/archive.html',
        controller: 'archiveCtrl',
        url: '/archive',
        resolve: {
            archivedLetters: (lcFactory) => {
                return lcFactory.getArchivedLetters({
                    offset: 0
                }).then(archived => {
                    return archived
                })
            }
        }
    })
});

app.controller('archiveCtrl', function($scope, archivedLetters, lcFactory) {
    $scope.letters = archivedLetters
    $scope.$watch("currentPage", function() {
        lcFactory.getArchivedLetters({
            offset: $scope.currentPage
        }).then(archivedLetters => {
            $scope.letters = archivedLetters
        })
    });
});