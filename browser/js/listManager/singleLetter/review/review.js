app.config(function($stateProvider) {
    $stateProvider.state('review', {
        templateUrl: 'js/listManager/singleLetter/review/review.html',
        controller: 'reviewCtrl',
        url: '/',
        parent: 'singleLetter'
    })
});

app.controller('reviewCtrl', function($scope) {

});