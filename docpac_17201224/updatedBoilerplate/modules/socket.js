function socketHandler (io) {
  io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
      console.log('user disconnected');
    });
    // socket.on('message', function (msg) {
    //   console.log('message: ' + msg);
    //   io.emit('message', msg);
    // });
  });
}

module.exports = {socketHandler};