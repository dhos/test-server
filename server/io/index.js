'use strict';
var socketio = require('socket.io');
var io = null;

module.exports = function(server) {

    if (io) return io;

    io = socketio(server);
    var onlineUser = []
    io.on('connection', function(Socket) {
        //whiteboard events
        Socket.on('logon', user => {
            onlineUser.push(user)

            // chat
            Socket.on('chat', function(message) {
                io.sockets.in(roomName).emit('message incoming', message)
            })

        })

    });

    return io;

};