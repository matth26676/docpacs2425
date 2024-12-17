module.exports = function (SERVER) {
    const IO = require('socket.io')(SERVER);

    //connection function
    IO.on("connection", (Socket) => {
        console.log("A user connected: " + Socket.id);

        //listen for "chatMessage" event from clients
        Socket.on("chatMessage", (message) => {
            console.log("Message received: " + message);
            // Broadcast message to all clients
            IO.emit("chatMessage", { userId: socket.id, message: message });
        });

        //listen for disconnection
        Socket.on("disconnect", () => {
            console.log("User disconnected: " + Socket.id);
        });
    });
};