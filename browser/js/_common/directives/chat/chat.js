app.directive('chat', function($rootScope, AuthService, AUTH_EVENTS, $state, Socket) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/_common/directives/chat/chat.html',
        link: function(scope) {
            scope.chat = false
            scope.selectedChat = false
            scope.chats = {}
            scope.open = () => {
                scope.chat = !scope.chat
            }
            var setUser = function() {
                AuthService.getLoggedInUser().then(function(user) {
                    scope.user = user;

                });
            };
            scope.startChat = (sid) => {
                if (scope.chats[sid]) {
                    scope.selectedChat = scope.chats[sid]
                } else {
                    scope.chats[sid] = []
                }
                scope.chatTarget = sid
            }
            Socket.on('identity', function(identity) {
                scope.self = identity
            })
            Socket.on('ChatList', function(onlineUsers) {
                scope.contactList = onlineUsers
                console.log(onlineUsers)
            })
            Socket.on('Incoming', function(newChat) {
                console.log(newChat)
                if (scope.chats[newChat]) {
                    scope.chats[newChat].push(newChat)
                } else {
                    scope.chats[newChat] = []
                }
            })
            scope.sendChat = (message) => {
                let chat = {
                    text: message,
                    date: Date.now(),
                    sender: scope.user,
                    target: scope.chatTarget
                }
                scope.message = null
                Socket.emit('chat', chat)
                scope.selectedChat.push(chat)
                console.log(scope.selectedChat)
            }
            var removeUser = function() {
                scope.user = null;
            };
            setUser()
            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
        }

    };

});