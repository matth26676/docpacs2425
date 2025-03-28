const readline = require('readline-sync');

var orders = [];

function mainMenu() {

    let result = readline.question("Would you like to 1). Start a New Order, 2). Edit an Existing Order, or 3). Show All Orders ")

    if (result == "1") {
        createOrder();
    } else if (result == "2") {
        editOrder();
    } else if (result == "3") {
        showOrders();
    } else {
        console.log("That is not an option.");
        mainMenu();
    };
};

function createOrder() {

    var name = readline.question("What is the name for the order? ");
    var address = readline.question("What is the (FAKE!!!)address the order should be delivered to? ");
    var order = {
        name: name,
        address: address,
        items: [],
        salesTax: 0,
        shiping: 0,
        subtotal: 0,
        total: 0,
        profit: 0
    }
    orders.push(order);
    mainMenu();
};

function editOrder() {

    if (orders.length === 0) {
        console.log("Sorry, there are no orders at this time.");
        mainMenu();
    };

    console.log("Existin Orders: ");
    orders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.name}`);
    });

    let orderNumber = parseInt(readline.question("What is the order number you would like to edit? ")) -1;
    if (orderNumber < 0 || orderNumber >= orders.length) {
        console.log("Sorry, that order does not exist.");
        mainMenu();
    }

    let order = orders[orderNumber];
    let editing = true;
    while (editing) {
        let action = readline.question("Would you like to, 1). Add an item, or 2). Finish editing? ");

        if (action === "1") {
            let itemName = readline.question("What item would you like to add to your order? ");
            let quantity = parseInt(readline.question("What is the quantity of that item? "));
            let unitPrice = parseFloat(readline.question("What is the unit price of that item? "));
            let retailPrice = parseFloat(readline.question("What is the retail price of that item? "));
            let item = {
                name: itemName,
                quantity: quantity,
                unitPrice: unitPrice,
                retailPrice: retailPrice
            };
            order.items.push(item);
            console.log("Item added.");
        } else if (action === "2") {
            calculations(order);
            editing = false;
        } else {
            console.log("That is not an option.");
            mainMenu();
        };
    };
    mainMenu();
};


function showOrders() {

    if (orders.length === 0) {
        console.log("Sorry, that order does not exist.");
        mainMenu();
    } else {
        orders.forEach((order => {
            console.log("-------------------------------------------");
            console.log(`Order for ${order.name} at ${order.address}`);
            order.items.forEach((item => {
                console.log(`${item.quantity} ${item.name} at $${item.unitPrice.toFixed(2)} each.`);
            }));

            console.log(`Subtotal: $${order.subtotal.toFixed(2)}`);
            console.log(`Profit: $${order.profit.toFixed(2)}`);
            console.log(`Sales Tax: $${order.salesTax.toFixed(2)}`);
            console.log(`Shiping: $${order.shiping.toFixed(2)}`);
            console.log(`Total: $${order.total.toFixed(2)}`);
            console.log("-------------------------------------------");
        }));

        mainMenu();
    };

};

function calculations(order) {

    order.subtotal = order.items.reduce((acc, item) => acc + (item.quantity * item.retailPrice), 0);
    const totalUnitCost = order.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    order.salesTax = order.subtotal * 0.06;
    order.shiping = order.subtotal < 50 ? 5 : 0;
    order.profit = order.subtotal - totalUnitCost
    order.total = order.subtotal + order.salesTax + order.shiping;

};

mainMenu();