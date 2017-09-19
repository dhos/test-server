app.config(function($stateProvider) {
    $stateProvider.state('editClient', {
        templateUrl: 'js/admin/clientlist/newClient.html',
        controller: 'editClientCtrl',
        url: '/editClient/:userId',
        resolve: {
            client: (clientFactory, $stateParams) => {
                return clientFactory.getSingleClient($stateParams.userId).then(client => {
                    //remember to shortcircuit if it's not a client
                    return client
                })
            },
            customers: customerFactory => {
                return customerFactory.getCustomers({}).then(customers => {
                    return customers
                })
            }
        }
    })
});

app.controller('editClientCtrl', function($scope, clientFactory, $state, client, $rootScope, LETTER_EVENTS, lcFactory, openModal, customers) {
    $scope.client = client
    $scope.customers = customers
    $scope.createClient = (user) => {
        openModal('Edit Client', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {

                clientFactory.updateClient(user).then(user => {
                    $state.go('clientlist')
                })
            }
        })
    }
});