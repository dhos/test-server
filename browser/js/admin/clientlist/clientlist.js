app.config(function($stateProvider) {
    $stateProvider.state('clientlist', {
        templateUrl: 'js/admin/clientlist/clientlist.html',
        controller: 'clientlistCtrl',
        url: '/clients',
        resolve: {
            clients: clientFactory => {
                return clientFactory.getclients({}).then(clients => {
                    return clients
                })
            }
        }
    })
});

app.controller('clientlistCtrl', function($scope, clients, userFactory, $state, $rootScope, LETTER_EVENTS, lcFactory) {
    $scope.clients = clients
    $scope.deleteclient = (UserId, index) => {
        openModal('Delete Client', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {

                $scope.clients.splice(index, 1)
                clientFactory.deleteUser({
                    id: UserId
                })
            }
        })
    }
    $scope.editCustomer = (UserId) => {
        $state.go('editCustomer', {
            userId: UserId
        })
    }
    $scope.newUser = () => {
        $state.go('newCustomer')
    }

});