function listUsers(args, io, socket){

    const sockets = io.sockets.sockets
    const roomName = socket.currentRoom
    const roomSockets = Array.from(sockets.values()).filter(socket => socket.rooms.has(roomName));
    console.log(roomSockets);

    let output = "Users: \n";
    output += roomSockets.map(socket => socket.user.username).join('\n');

    return output;
}

function joinRoom(args, io, socket){

    if(args.length === 0) return "Please provide a room name";

    const roomName = args[0];

    if(roomName.trim() === '') return "Please provide a room name";
    if(socket.rooms.has(roomName)) return `You are already in that room.`;

    socket.join(roomName);

    let roomsList = Array.from(socket.rooms).filter(room => room !== socket.id);
    socket.currentRoom = roomName;
    socket.emit('update rooms list',{newList: roomsList});
    socket.emit('update current room', {currentRoom: socket.currentRoom});

    return `Joined Room: ${roomName}`;
}

function leaveRoom(args, io, socket){

    if(args.length === 0){
        return "Please provide a room name";
    }

    const roomName = args[0];

    if(!socket.rooms.has(roomName)) return `You are not in room: ${roomName}`;
    if(roomName === 'general') return `You cannot leave general`;

    socket.leave(roomName);

    let roomsList = Array.from(socket.rooms).filter(room => room !== socket.id);
    socket.currentRoom = roomsList[roomsList.length - 1];
    socket.emit('update rooms list',{newList: roomsList});
    socket.emit('update current room', {currentRoom: socket.currentRoom});

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