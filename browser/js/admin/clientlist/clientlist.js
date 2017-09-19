app.config(function($stateProvider) {
    $stateProvider.state('clientlist', {
        templateUrl: 'js/admin/clientlist/clientlist.html',
        controller: 'clientlistCtrl',
        url: '/clients',
        resolve: {
            clients: clientFactory => {
                return clientFactory.getClients({}).then(clients => {
                    return clients
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

app.controller('clientlistCtrl', function($scope, clients, userFactory, $state, $rootScope, LETTER_EVENTS, lcFactory, customers, openModal, clientFactory) {
    $scope.clients = clients
    $scope.customers = customers
    $scope.customers.forEach(customer => {
        $scope.customers[customer.id] = customer.name
    })
    $scope.deleteClient = (UserId, index) => {
        openModal('Delete Client', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {
                $scope.clients.splice(index, 1)
                clientFactory.deleteClient({
                    id: UserId
                })
            }
        })
    }
    $scope.editClient = (UserId) => {
        $state.go('editClient', {
            userId: UserId
        })
    }
    $scope.newUser = () => {
        $state.go('newCustomer')
    }

});