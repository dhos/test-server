app.config(function($stateProvider) {
    $stateProvider.state('editClient', {
        templateUrl: 'js/admin/clientlist/newCustomer.html',
        controller: 'editClientCtrl',
        url: '/editClient/:userId',
        resolve: {
            client: (clientFactory, $stateParams) => {
                return clientFactory.getSingleClient($stateParams.userId).then(client => {
                    //remember to shortcircuit if it's not a client
                    return client
                })
            },
        }
    })
});

app.controller('editClientCtrl', function($scope, clientFactory, $state, client, $rootScope, LETTER_EVENTS, lcFactory, openModal) {
    $scope.user = client
    $scope.user.number = Number($scope.user.number)
    $scope.createclient = (user) => {
        openModal('Edit Client', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {

                clientFactory.updateCustomer(user).then(user => {
                    $state.go('clientlist')
                })
            }
        })
    }
});