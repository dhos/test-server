'use strict';
var socketio = require('socket.io');
var io = null;

module.exports = function(server) {

    if (io) return io;

    io = socketio(server);
    var onlineUsers = {}
    io.on('connection', function(Socket) {
        //whiteboard events
        Socket.on('logon', user => {
            if (user) {
                onlineUsers[user.id] = {
                    sid: Socket.id,
                    user: user
                }
              }
            }
            io.to(Socket.id).emit('identity', Socket.id)
            Socket.emit('ChatList', onlineUsers)
                // chat

        })
        Socket.on('chat', function(message) {
            console.log(message)
            io.to(message.target).emit('Incoming', message)
        })
    });

    return io;

};
