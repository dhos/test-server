// app.config(function($stateProvider) {
//     $stateProvider.state('newCustomer', {
//         templateUrl: 'js/admin/customerlist/newCustomer.html',
//         controller: 'newCustomerCtrl',
//         url: '/newCustomer',
//         resolve: {}
//     })
// });

// app.controller('newCustomerCtrl', function($scope, customerFactory, $state, $rootScope, LETTER_EVENTS, lcFactory, openModal) {
//     $scope.submitting = false
//     $scope.makeUser = (user) => {
//         openModal('Create Customer', 'Are you sure?', 'prompt', 'confirm').then(result => {
//             if(result){

//                 customerFactory.createCustomer(user).then(user => {
//                     $state.go('customerList')
//                 })
//             }
//         })
//     }
// });