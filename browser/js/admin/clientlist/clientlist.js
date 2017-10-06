app.config(function($stateProvider) {
    $stateProvider.state('clientlist', {
        templateUrl: 'js/admin/clientlist/clientlist.html',
        controller: 'clientlistCtrl',
        url: '/clients',
        resolve: {
            clients: clientFactory => {
                return clientFactory.getClients({
                    offset: 0,
                    where: {}
                }).then(clients => {
                    console.log(clients)
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
    $scope.displayClients = clients
    $scope.customers = customers
    $scope.customers.forEach(customer => {
        $scope.customers[customer.id] = customer.name
    })
    $scope.deleteClient = (client_code, index) => {
        openModal('Delete Client', 'Are you sure?', 'prompt', 'confirm').then(result => {
            if (result) {
                $scope.displayClients.rows.splice(index, 1)
                clientFactory.deleteClient({
                    client_code: client_code
                })
            }
        })
    }
    $scope.editClient = (clientId) => {
        $state.go('editClient', {
            clientId: clientId
        })
    }

    $scope.currentPage = 1
    $scope.numPerPage = 100
    $scope.$watch("currentPage", function() {
        clientFactory.getClients({
            offset: $scope.currentPage - 1,
            where: {}
        }).then(clients => {
            $scope.displayClients = clients
        })
    });

});