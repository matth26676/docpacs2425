function connection(io, socket) {
    console.log('a user connected');

    socket.on('chat message', (data) => {
        chatMessage(io, socket, data);
    });

    socket.on('disconnect', () => {
        disconnect(io, socket);
    });
}

function disconnection(io, socket) {
    console.log('user disconnected');
}

function chatMessage(io, socket, data) {

    const payload = {
        message: data.message,
        sender: socket.request.session.user
    }

    io.emit('chat message', payload);
}

module.exports = {
    connection,
    disconnection,
    chatMessage
}