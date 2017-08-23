app.config(function($stateProvider) {
    $stateProvider.state('clauseManager', {
        templateUrl: 'js/clauseManager/clauseManager.html',
        controller: 'clauseManagerCtrl',
        url: '/clauseManager'
    })
});

app.controller('clauseManagerCtrl', function($scope) {

});