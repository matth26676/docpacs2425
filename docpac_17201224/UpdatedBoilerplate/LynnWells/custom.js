function nsync() {
    for (var i = 0; i < 3; i++) {
        console.log(`O dullahan`);
    }
}

const erlking = name => {
    name = name + " the Erlking";
    console.log(name);
}

const callBackReq = (req, res) => {
    res.send("I'll stuff you inside this sack, drag it to the deepest depths of inferno, and then pummel it until my strength fails me");
}

module.exports = {
    nsync: nsync,
    erlking,
    callBackReq,
}
