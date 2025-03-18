const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let orders = [];

function newOrder() {
    rl.question('What is your name? ', (name) => {
        let order = { name, address: '', items: [], subtotal: 0, salesTax: 0, shipping: 0, total: 0 };
        rl.question('What is your address? ', (address) => {
            order.address = address;
            orders.push(order);
            console.log("Order added successfully!\n");
            mainMenu();
        });
    });
}

ordermath = (order) => {
    let subtotal = 0;
    for (let i = 0; i < order.items.length; i++) {
        subtotal += order.items[i].price * order.items[i].quantity;
    }

    let shipping = 0;

    if (subtotal < 50) {
        shipping = 5;
    } else {
        shipping = 0;
    }

    let salesTax = subtotal * 0.06;
    let total = subtotal + salesTax + shipping;

    order.subtotal = subtotal;
    order.salesTax = salesTax;
    order.shipping = shipping;
    order.total = total;

    rl.write(`\nSubtotal: $${subtotal.toFixed(2)}\nSales Tax: $${salesTax.toFixed(2)}\nShipping: $${shipping.toFixed(2)}\nTotal: $${total.toFixed(2)}\n`);
}

function showOrders() {
    if (orders.length === 0) {
        console.log("\nNo orders available.");
    } else {
        console.log("\nAll Orders:");
        orders.forEach((order, index) => {
            console.log(`\nOrder ${index + 1} - Name: ${order.name}, Address: ${order.address}`);
            if (order.items.length > 0) {
                console.log("Items:");
                order.items.forEach((item, i) => {
                    console.log(`  ${i + 1}. ${item.name} - Quantity: ${item.quantity}, Price: $${item.price.toFixed(2)}`);
                });
               rl.write(`\nSubtotal: $${order.subtotal.toFixed(2)}\nSales Tax: $${order.salesTax.toFixed(2)}\nShipping: $${order.shipping.toFixed(2)}\nTotal: $${order.total.toFixed(2)}\n`);
            } else {
                console.log("  No items in this order.");
            }
        });
    }
    mainMenu();
}

function editOrder() {
    if (orders.length === 0) {
        console.log("\n No orders to edit.");
        mainMenu();
    }

    orders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.name}`);
    });

    rl.question('Which order would you like to edit? ', (orderNumber) => {
        let orderIndex = orderNumber - 1;

        if (isNaN(orderIndex) || orderIndex < 0 || orderIndex >= orders.length) {
            console.log("Invalid order number.\n");
            mainMenu();
            return;
        }

        editOrderMenu(orders[orderIndex]);
    });
}

function mainMenu() {
    rl.write("\n 1. Start A New Order \n 2. Edit Existing Order \n 3. Show All Orders. \n");

    rl.question('\n What would you like to do? ', (answer) => {
        switch (answer.trim()) {
            case '1':
                newOrder();
                break;

            case '2':
                editOrder();
                break;

            case '3':
                if (orders.length === 0) {
                    console.log("No orders available.");
                } else {
                    showOrders();
                }
                break;

            default:
                console.log('Please enter a valid option (1, 2, or 3).\n');
                mainMenu();
        }
    });
}

function buyItem(order) {
    rl.question('What item would you like to add? ', (itemName) => {
        rl.question('How many would you like to add? ', (quantity) => {
            rl.question('What is the price of the item? ', (price) => {
                const newItem = {
                    name: itemName,
                    quantity: parseFloat(quantity),
                    price: parseFloat(price)
                };
                order.items.push(newItem);
                console.log("Item added successfully!\n");
                editOrderMenu(order);
            });
        });
    });
}

function editOrderMenu(order) {
    rl.question('Would you like to \n 1. Add an Item \n 2. Finish Editing \n ', (answer) => {
        switch (answer.trim()) {
            case '1':
                buyItem(order);
                break;
            case '2':
                ordermath(order);
                console.log("Finished editing");
                mainMenu();
                break;
            default:
                console.log('Please enter a valid option (1 or 2).\n');
                editOrderMenu(order);
        }
    });
}

mainMenu();
