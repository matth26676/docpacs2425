function listUsers(args, io, socket){
    const users = Object.keys(io.sockets.sockets).map(id => {
        return io.sockets[id].user;
    });

    console.log(users);
    return JSON.stringify(users);
}

const commandMap = new Map([
    ['users', listUsers]
]);

module.exports = {
    commandMap,
    listUsers
}