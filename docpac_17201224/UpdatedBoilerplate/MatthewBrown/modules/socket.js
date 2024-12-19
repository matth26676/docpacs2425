function testAlert() {
    console.log('Hello Sockets.js!');
}

function connection(io, socket) {
    console.log('A user connected');
    socket.on('message', (msg) => {
        const user = socket.request.session.user;
        const timestamp = new Date().toLocaleTimeString();
        const messageData = {
            user: user.username,
            message: msg,
            time: timestamp
        };
        console.log('Message received:', messageData);
        // Emit the message to all connected clients including the sender
        io.emit('message', messageData);
    });
}

module.exports = {
    testAlert,
    connection
};