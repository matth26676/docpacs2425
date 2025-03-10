const socketIo = require('socket.io');

function handleSocketConnection(server) {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });

        socket.on('chat message', (msg) => {
            const messageWithUser = {
                username: socket.handshake.query.username,
                message: msg
            };
            io.emit('chat message', messageWithUser);
        });
    });
}

module.exports = handleSocketConnection;