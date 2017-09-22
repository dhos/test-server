app.directive('chat', function($rootScope, AuthService, AUTH_EVENTS, $state, Socket) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/_common/directives/chat/chat.html',
        controller: function($scope) {
            $scope.chat = false
            $scope.selectedChat = false
            $scope.chats = {}
            $scope.open = () => {
                $scope.chat = !$scope.chat
            }
            var setUser = function() {
                AuthService.getLoggedInUser().then(function(user) {
                    $scope.user = user;

                });
            };
            $scope.date = new Date();
            $scope.startChat = (userId) => {
                $scope.newMessage = false
                if ($scope.chats[userId]) {
                    $scope.selectedChat = $scope.chats[userId]
                } else {
                    $scope.chats[userId] = []
                }
                $scope.chatTarget = userId
            }
            $scope.back = () => {
                $scope.selectedChat = false
            }
            Socket.on('identity', function(identity) {
                $scope.self = identity
            })
            Socket.on('ChatList', function(onlineUsers) {
                $scope.contactList = onlineUsers
            })
            Socket.on('Incoming', function(newChat) {
                $scope.newMessage = true
                if ($scope.chats[newChat.sender.id]) {
                    $scope.chats[newChat.sender.id].push(newChat)
                } else {
                    $scope.chats[newChat.sender.id] = []
                }
            })
            $scope.sendChat = () => {
                console.log($scope.message)
                debugger
                if (!$scope.message) return
                let chat = {
                    text: $scope.message,
                    date: Date.now(),
                    sender: $scope.user,
                    target: $scope.chatTarget
                }
                $('#chatBox').val('')
                $scope.message = null
                $scope.selectedChat.push(chat)
                Socket.emit('chat', chat)
            }
            var removeUser = function() {
                $scope.user = null;
            };
            setUser()
            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
        }

    };

});