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
    $scope.currentPage = 1
    $scope.numPerPage = 100
    $scope.$watch("currentPage", function() {
        clientFactory.getClients({
            offset: $scope.currentPage,
            where: {}
        }).then(clients => {
            $scope.displayClients = clients
        })
    });

});