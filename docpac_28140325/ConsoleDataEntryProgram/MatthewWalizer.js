// You need to download the readline-sync package to run this code.
const readlineSync = require('readline-sync');
var orders = [];

while (true) {
    console.clear(); console.log('1. Start a New Order \n2. Edit Existing Order \n3. Show All Orders');
    let answer = readlineSync.question('What would you like to do? ');
    switch (answer) {
        case '1':
            console.clear();
            let newOrderName = readlineSync.question('What is the name of the customer? ');
            let newOrderAddress = readlineSync.question('What is the address of the customer? ');
            let newOrder = { name: newOrderName, address: newOrderAddress };
            orders.push(newOrder);
            break;

        case '2':
            let currentlyEditing = true;
            while (currentlyEditing) {
                console.clear(); console.log('1. Add an Item \n2. Finish Editing');
                let choice = readlineSync.question('What would you like to do? ');
                switch (choice) {
                    case '1':
                        console.clear(); console.log('Available Orders:');
                        for (let i = 0; i < orders.length; i++) {
                            console.log((i + 1) + '. ' + orders[i].name);
                        }
                        let orderNumber = readlineSync.question('Which order would you like to edit? ');
                        let order = orders[orderNumber - 1];
                        let itemName = readlineSync.question('What is the name of the item? ');
                        let itemQuantity = readlineSync.question('What is the quantity of the item? ');
                        let itemPrice = readlineSync.question('What is the price of the item? $');
                        let newItem = { name: itemName, quantity: itemQuantity, price: itemPrice };
                        if (!order.items) {
                            order.items = [];
                        }
                        order.items.push(newItem);
                        break;
                    case '2':
                        orders.forEach((order) => {
                            order.subTotal = 0;
                            for (let i = 0; i < order.items.length; i++) {
                                order.subTotal += order.items[i].quantity * order.items[i].price;
                            }
                            order.subTotal.toFixed(2);
                            order.salesTax = order.subTotal * 0.06;
                            if (order.subTotal < 50) {
                                order.shipping = 5;
                            } else {
                                order.shipping = 0;
                            }
                            order.total = order.subTotal + order.salesTax + order.shipping;
                            order.total = order.total.toFixed(2);
                            currentlyEditing = false;
                        });
                        break;
                    default:
                        break;
                }
            }
            break;
        case '3':
            console.clear();
            orders.forEach((order) => {
                console.log(''); console.log('Customer Name: ' + order.name); console.log('Address: ' + order.address);
                if (order.items) {
                    console.log('Items Ordered:');
                    for (let i = 0; i < order.items.length; i++) {
                        console.log('  Item: ' + order.items[i].name + ' | Quantity: ' + order.items[i].quantity + ' | Unit Price: $' + order.items[i].price);
                    }
                    console.log('Subtotal: $' + order.subTotal.toFixed(2) + '\nShipping: $' + order.shipping.toFixed(2) + '\nSales Tax (6%): $' + order.salesTax.toFixed(2) + '\nTotal: $' + order.total);
                }
            });
            readlineSync.question('Press Enter to Continue');
            console.clear();
            break;
        default:
            break;
    }
}