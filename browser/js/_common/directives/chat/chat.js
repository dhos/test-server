app.directive('chat', function($rootScope, AuthService, AUTH_EVENTS, $state, Socket) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/_common/directives/chat/chat.html',
        controller: function($scope) {
            $scope.chat = false
            $scope.selectedChat = false
            $scope.chats = {}
            $scope.newChat = {
                message: ''
            }
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
                    $scope.chats[userId].newMessage = false
                } else {
                    $scope.chats[userId] = {
                        chat: [],
                        newMessage: false
                    }
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
                console.log('hello')
                $scope.contactList = onlineUsers
            })
            Socket.on('Incoming', function(newChat) {
                $scope.newMessage = true
                console.log(newChat)
                if ($scope.chats[newChat.sender.id]) {
                    $scope.chats[newChat.sender.id].chat.push(newChat)
                    $scope.chats[newChat.sender.id].newMessage = true
                } else {
                    $scope.chats[userId] = {
                        chat: [newChat],
                        newMessage: true
                    }
                }
            })
            $scope.sendChat = (newChat) => {
                console.log($scope.newChat)
                if (!$scope.newChat.message) return
                let chat = {
                    text: $scope.newChat.message,
                    date: Date.now(),
                    sender: $scope.user,
                    target: $scope.chatTarget
                }
                $('#chatBox').val('')
                $scope.newChat.message = null
                $scope.selectedChat.chat.push(chat)
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