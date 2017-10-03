app.config(function($stateProvider) {
    $stateProvider.state('newClient', {
        templateUrl: 'js/admin/clientlist/newClient.html',
        controller: 'newClientCtrl',
        url: '/newClient',
        resolve: {
            customers: customerFactory => {
                return customerFactory.getCustomers({}).then(customers => {
                    return customers
                })
            }
        }
    })
});

app.controller('newClientCtrl', function($scope, $state, openModal, customers, clientFactory) {
    $scope.customers = customers
    $scope.selectedCustomer = {}
    $scope.createClient = (client) => {
        client.customer = $scope.selectedCustomer
        openModal('Create Client', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {
                clientFactory.createClient(client).then(() => {
                    $state.go('clientlist')
                }).catch(err => {
                    openModal('Error', err.message, 'warning', 'warning')
                })
            }
        })
    }
});