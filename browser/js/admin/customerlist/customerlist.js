app.config(function($stateProvider) {
    $stateProvider.state('customerList', {
        templateUrl: 'js/admin/customerList/customerList.html',
        controller: 'customerListCtrl',
        url: '/customers',
        resolve: {
            customers: userFactory => {
                return userFactory.getUsers({
                    role: 0
                }).then(customers => {
                    return customers
                })
            }
        }
    })
});

app.controller('customerListCtrl', function($scope, customers, userFactory, $state, $rootScope, LETTER_EVENTS, lcFactory) {
    $scope.customers = customers
    $scope.deleteUser = (UserId, index) => {
        $scope.customers.splice(index, 1)
        userFactory.deleteUser({
            id: UserId
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
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Pending Update'
    }
    var refreshLetters = () => {
        lcFactory.getLetters({}).then(letters => {
            $scope.letters = letters
            $scope.New = []
            $scope.Reviewed = []
            $scope.Amended = []
            $scope.Frozen = []
            $scope.Update = []
            $scope.letters = letters
                //set states
            $scope.letters.forEach(letter => {
                $scope[$scope.state[letter.state]].push(letter)
            })
            $scope.Frozen.forEach(frozen => {
                if (frozen.finDoc === 0) $scope.Update.push(frozen)
            })
        })
        lcFactory.getExpiringLetters({}).then(expiring => {
            $scope.Expiring = expiring[0]
        })
    }
    $rootScope.$on(LETTER_EVENTS.refreshLetters, refreshLetters);

    refreshLetters();
});