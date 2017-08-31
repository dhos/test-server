'use strict';
var socketio = require('socket.io');
var io = null;

module.exports = function(server) {

    if (io) return io;

    io = socketio(server);
    var draws = {}
    var chats = {}
    io.on('connection', function(Socket) {
        //whiteboard events
        Socket.on('join classroom', roomName => {
            console.log('i joined', roomName)
            Socket.join(roomName)
            if (!draws[roomName]) draws[roomName] = []
            else Socket.to(roomName).emit('board', draws[roomName])
            if (!draws[roomName]) chats[roomName] = []
            else Socket.to(roomName).emit('chatHistory', draws[roomName])

            Socket.on('drawing', function(start, end, color) {
                draws[roomName].push({
                    start: start,
                    end: end,
                    color: color
                })
                Socket.broadcast.to(roomName).emit('collaboratorDraw', start, end, color)
            })

            Socket.on('erase all', function(bool) {
                draws[roomName] = []
                io.sockets.in(roomName).emit('erasing', true)
            })

            // chat
            Socket.on('chat', function(message) {
                io.sockets.in(roomName).emit('message incoming', message)
            })

        })

    });

    return io;

};