const readline = require("readline-sync");

const orders = [];
while (true) {
    console.log("[1] Start a new order");
    console.log("[2] Edit existing order");
    console.log("[3] Show all orders");

    const userChoice = readline.question("What would you like to do? ");
    switch (userChoice) {
        case "1": {
            // Start new order
            const order = {
                name: readline.question("What is your name? "),
                address: readline.question("What is your address? "),
                items: []
            };

            orders.push(order);
            break;
        }
        case "2": {
            while (true) {
                // Edit existing order
                for (let i = 0; i < orders.length; i++) {
                    console.log(`[${i + 1}] Order ${i + 1}`);
                }

                const orderToEditNum = Number(readline.question("Which order would you like to edit? ")) - 1;
                const order = orders[orderToEditNum];

                console.log("[1] Add an item");
                console.log("[2] Finish editing");

                const userAction = readline.question("What would you like to do? ");
                if (userAction == "1") {
                    // Add an item
                    const item = {
                        name: readline.question("What is the item's name? "),
                        quantity: readline.question("What is the quantity of this item? "),
                        unitPrice: readline.question("How much is this item's unit price? "),
                        retailPrice: readline.question("How much is this item's retail price? ")
                    }

                    order.items.push(item);
                } else if (userAction == "2") {
                    // Finish editing
                    let retailPriceSubtotal = 0;
                    let unitPriceSubtotal = 0;
                    for (const item of order.items) {
                        retailPriceSubtotal += item.retailPrice * item.quantity;
                        unitPriceSubtotal += item.unitPrice * item.quantity;
                    }

                    const profit = retailPriceSubtotal - unitPriceSubtotal;
                    const salesTax = retailPriceSubtotal * 0.06;
                    const shippingFee = retailPriceSubtotal < 50 ? 5 : 0;
                    const total = retailPriceSubtotal + salesTax + shippingFee;
                    order.retailPriceSubtotal = retailPriceSubtotal;
                    order.unitPriceSubtotal = unitPriceSubtotal;
                    order.profit = profit;
                    order.salesTax = salesTax;
                    order.shippingFee = shippingFee;
                    order.total = total;
                    break;
                }
            }

            break;
        } 
        case "3": {
            // Show all orders
            for (const order of orders) {
                const orderNum = orders.indexOf(order);
                console.log(`Order ${orderNum + 1}:`);
                console.log(`   Customer name: ${order.name}`);
                console.log(`   Customer address: ${order.address}`);

                // Display all items in order
                console.log("   Items:")
                for (const item of order.items) {
                    console.log(`       ${item.name}:`);
                    console.log(`           Quantity: ${item.quantity}`);
                    console.log(`           Unit price: ${item.unitPrice}`);
                }
                
                console.log(`Subtotal: ${order.retailPriceSubtotal}`);
                console.log(`Sales Tax: ${order.salesTax}`);
                console.log(`Shipping Fee: ${order.shippingFee}`);
                console.log(`Total: ${order.total}`);
            }
            break;
        }
    }
}