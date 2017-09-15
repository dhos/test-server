app.config(function($stateProvider) {
    $stateProvider.state('editCustomer', {
        templateUrl: 'js/admin/customerList/editCustomer.html',
        controller: 'editCustomerCtrl',
        url: '/editCustomer/:userId',
        resolve: {
            customer: (customerFactory, $stateParams) => {
                return customerFactory.getSingleCustomer($stateParams.userId).then(customer => {
                    //remember to shortcircuit if it's not a customer
                    return customer
                })
            },
        }
    })
});

app.controller('editCustomerCtrl', function($scope, customerFactory, $state, customer, $rootScope, LETTER_EVENTS, lcFactory) {
    $scope.user = customer
    $scope.user.number = Number($scope.user.number)
    console.log($scope.user)
    $scope.makeUser = (user) => {
        customerFactory.updateCustomer(user).then(user => {
            $state.go('customerList')
        })
    }
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Revised'
    }
    var refreshLetters = () => {
        lcFactory.getLetters({}).then(letters => {
            $scope.letters = letters
            $scope.New = []
            $scope.Reviewed = []
            $scope.Amended = []
            $scope.Frozen = []
            $scope.Revised = []
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