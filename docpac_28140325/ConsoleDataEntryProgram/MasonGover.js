const readlineSync = require("readline-sync")

const orders = [];
let isEditing = false;
while (true) {
    console.log("[1] Start a new order");
    console.log("[2] Edit existing order");
    console.log("[3] Show all orders");
    const option = readlineSync.question("What would you like to do? ");

    switch (option) {
        case "1": {
            const order = {
                name: readlineSync.question("What is the customer's name? "),
                address: readlineSync.question("What is the customer's address? "),
                items: []
            }

            orders.push(order);
            console.log("Successfully saved order");
            break;
        }
        case "2": {
            isEditing = true;
            while (isEditing) {
                // List all orders then ask the user which order they would like to edit
                console.log("Orders:");
                for (const order of orders) {
                    const orderNumber = orders.indexOf(order) + 1;
                    console.log(`   [${orderNumber}] Order ${orderNumber}`);
                }
                const selectedOrderNumber = parseInt(readlineSync.question("Which order would you like to edit? ")) - 1;
                const orderToEdit = orders[selectedOrderNumber];

                // Ask the user what they would like to do
                console.log("[1] Add an item");
                console.log("[2] Finish editing");
                const editOption = readlineSync.question("What would you like to do? ");

                if (editOption == "1") {
                    // Add an item
                    const item = {
                        name: readlineSync.question("What is the name of the item? "),
                        quantity: readlineSync.question("What is the quantity of the item? "),
                        price: readlineSync.question("What is the price of the item? ")
                    }
                    
                    orderToEdit.items.push(item);
                } else if (editOption == "2") {
                    // Finish editing
                    let subtotal = 0;
                    for (const order of orders) {
                        for (const item of order.items) {
                            subtotal += item.price * item.quantity;
                        }
                    }

                    const salesTax = subtotal * 0.06;
                    const shippingFee = subtotal < 50 ? 5 : 0;
                    const total = subtotal + salesTax + shippingFee;
                    orderToEdit.subtotal = subtotal;
                    orderToEdit.salesTax = salesTax;
                    orderToEdit.shippingFee = shippingFee;
                    orderToEdit.total = total;
                    isEditing = false;
                }
            }
            break;
        }
        case "3": {
            for (const order of orders) {
                console.log(`Customer name: ${order.name}`);
                console.log(`Customer address: ${order.address}`);
                console.log("Items:")
                for (const item of order.items) {
                    console.log(`Item name: ${item.name}`);
                    console.log(`Item quantity: ${item.quantity}`);
                    console.log(`Item unit price: ${item.price}`);
                }
                console.log(`Subtotal: ${order.subtotal}`);
                console.log(`Sales tax: ${order.salesTax}`);
                console.log(`Shipping fee: ${order.shippingFee}`);
                console.log(`Total: ${order.total}`);
            }
            break;
        }
    }
}