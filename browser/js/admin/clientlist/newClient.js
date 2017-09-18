app.config(function($stateProvider) {
    $stateProvider.state('newClient', {
        templateUrl: 'js/admin/clientlist/newClient.html',
        controller: 'newClientCtrl',
        url: '/newBank',
        resolve: {}
    })
});

app.controller('newClientCtrl', function($scope, bankFactory, $state, $rootScope, LETTER_EVENTS, lcFactory, usSpinnerService, openModal) {
    $scope.createBank = (bank) => {
        openModal('Create Client', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {
                bankFactory.createBank(bank).then(bank => {
                    $state.go('clientlist')
                })
            }
        })
    }
});