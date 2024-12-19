function connection(io, socket) {
    console.log('a user connected');

    socket.on('chat message', (data) => {
        chatMessage(io, socket, data);
    });

    socket.on('disconnect', () => {
        disconnection(io, socket);
    });
}

function disconnection(io, socket) {
    console.log('user disconnected');
}

function chatMessage(io, socket, data) {

    const payload = {
        text: data.text,
        sender: socket.request.session.user.username,
        timestamp: new Date().toISOString()
    }

    io.emit('chat message', payload);
}

module.exports = {
    connection,
    disconnection,
    chatMessage
}