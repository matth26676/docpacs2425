function listUsers(args, io, socket){

    const users = Array.from(io.sockets.sockets.values()).map(socket => socket.user);
    const roomName = Array.from(socket.rooms).pop();

    const roomUsers = users.filter(user => {
        const userSocket = io.sockets.sockets[user.id];
        return userSocket && userSocket.rooms && userSocket.rooms.has(roomName);
    });

    let output = "Users:\n";
    output += roomUsers.map(user => user.fb_name).join('\n');

    return output;
}

function joinRoom(args, io, socket){

    if(args.length === 0){
        return "Please provide a room name";
    }

    const roomName = args[0];
    socket.join(roomName);
    return `Joined Room: ${roomName}`;
}

function leaveRoom(args, io, socket){

    if(args.length === 0){
        return "Please provide a room name";
    }

    const roomName = args[0];
    socket.leave(roomName);
    return `Left Room: ${roomName}`;
}

const commandMap = new Map([
    ['users', listUsers],
    ['join', joinRoom],
    ['leave', leaveRoom],
]);

module.exports = {
    commandMap,
}