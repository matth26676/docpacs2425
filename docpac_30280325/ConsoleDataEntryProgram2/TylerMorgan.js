const prompt = require('prompt-sync')();
while (true) {

    var question = prompt("1:start a new order, 2:edit orders, 3:show all orders, 4:GET OUT | ");
    var order = [];
    var addresses = [];
    
    if (question == 1) {
        var item = prompt("What would you like to order?");
        var address = prompt("Where are you currently residing at?");
        order.push(item);
        addresses.push(address);
        console.log(order, addresses);
    } else if (question == 2) { 
        console.log("aids");
    }
    else if (question == 3) {
        console.log("aids");
    }
    else if (question == 4) {
        console.log("bye pookie, 😘");
        break;
    }
    else {
        console.log("invalid input, input a number between 1-4");
    }
}