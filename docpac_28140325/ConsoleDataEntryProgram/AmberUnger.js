const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let orders = [];

function getRandomPrice() {
    return (Math.random() * 100).toFixed(2);
}

function calculateSubtotal(items) {
    return items.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
}

function calculateSalesTax(subtotal) {
    return (subtotal * 0.06).toFixed(2);
}

function calculateShipping(subtotal) {
    return subtotal < 50 ? 5.00 : 0.00;
}

function calculateTotal(subtotal, salesTax, shipping) {
    return (parseFloat(subtotal) + parseFloat(salesTax) + parseFloat(shipping)).toFixed(2);
}

function askQuestion() {
    rl.question("What would you like to do? Enter the number for your selection: 1. Start a new order 2. Edit existing order 3. Show all orders 4. Leave\n", function(userChoice) {
        switch (userChoice.trim()) {
            case '1':
                console.log("Starting a new order...");
                rl.question("What is the name for the order?\n", function(name) {
                    rl.question("What is your (Fake) address?\n", function(address) {
                        let items = [];
                        function askForItem() {
                            rl.question("What would you like to order? (Type 'done' when finished)\n", function(order) {
                                if (order.trim().toLowerCase() === 'done') {
                                    const subtotal = calculateSubtotal(items);
                                    const salesTax = calculateSalesTax(subtotal);
                                    const shipping = calculateShipping(subtotal);
                                    const total = calculateTotal(subtotal, salesTax, shipping);
                                    orders.push({ name, address, items, subtotal, salesTax, shipping, total });
                                    console.log(`Thank you ${name} for your order of ${items.map(item => `${item.name} ($${item.price} x ${item.quantity})`).join(', ')}. Your order will be delivered to ${address} in 30 minutes. Subtotal: $${subtotal}, Sales Tax: $${salesTax}, Shipping: $${shipping}, Total: $${total}`);
                                    askQuestion();
                                } else {
                                    rl.question("Enter the quantity:\n", function(quantity) {
                                        items.push({ name: order.trim(), price: getRandomPrice(), quantity: parseInt(quantity) });
                                        askForItem();
                                    });
                                }
                            });
                        }
                        askForItem();
                    });
                });
                break;
            case '2':
                if (orders.length === 0) {
                    console.log("No orders to edit.");
                    askQuestion();
                } else {
                    console.log("Editing an existing order...");
                    orders.forEach((order, index) => {
                        console.log(`${index + 1}. ${order.name} - ${order.address} - ${order.items.map(item => `${item.name} ($${item.price} x ${item.quantity})`).join(', ')} - Subtotal: $${order.subtotal}, Sales Tax: $${order.salesTax}, Shipping: $${order.shipping}, Total: $${order.total}`);
                    });
                    rl.question("Enter the number of the order you want to edit:\n", function(orderNumber) {
                        const orderIndex = parseInt(orderNumber.trim()) - 1;
                        if (orderIndex >= 0 && orderIndex < orders.length) {
                            let order = orders[orderIndex];
                            rl.question(`What would you like to edit? Enter the number for your selection: 1. Name 2. Address 3. Add item 4. Remove item\n`, function(editChoice) {
                                switch (editChoice.trim()) {
                                    case '1':
                                        rl.question(`Enter new name for the order (current: ${order.name}):\n`, function(newName) {
                                            order.name = newName || order.name;
                                            console.log(`Order updated: ${order.name} - ${order.address} - ${order.items.map(item => `${item.name} ($${item.price} x ${item.quantity})`).join(', ')} - Subtotal: $${order.subtotal}, Sales Tax: $${order.salesTax}, Shipping: $${order.shipping}, Total: $${order.total}`);
                                            askQuestion();
                                        });
                                        break;
                                    case '2':
                                        rl.question(`Enter new address for the order (current: ${order.address}):\n`, function(newAddress) {
                                            order.address = newAddress || order.address;
                                            console.log(`Order updated: ${order.name} - ${order.address} - ${order.items.map(item => `${item.name} ($${item.price} x ${item.quantity})`).join(', ')} - Subtotal: $${order.subtotal}, Sales Tax: $${order.salesTax}, Shipping: $${order.shipping}, Total: $${order.total}`);
                                            askQuestion();
                                        });
                                        break;
                                    case '3':
                                        function askForNewItem() {
                                            rl.question("What would you like to add? (Type 'done' when finished)\n", function(newOrder) {
                                                if (newOrder.trim().toLowerCase() === 'done') {
                                                    order.subtotal = calculateSubtotal(order.items);
                                                    order.salesTax = calculateSalesTax(order.subtotal);
                                                    order.shipping = calculateShipping(order.subtotal);
                                                    order.total = calculateTotal(order.subtotal, order.salesTax, order.shipping);
                                                    console.log(`Order updated: ${order.name} - ${order.address} - ${order.items.map(item => `${item.name} ($${item.price} x ${item.quantity})`).join(', ')} - Subtotal: $${order.subtotal}, Sales Tax: $${order.salesTax}, Shipping: $${order.shipping}, Total: $${order.total}`);
                                                    askQuestion();
                                                } else {
                                                    rl.question("Enter the quantity:\n", function(quantity) {
                                                        order.items.push({ name: newOrder.trim(), price: getRandomPrice(), quantity: parseInt(quantity) });
                                                        askForNewItem();
                                                    });
                                                }
                                            });
                                        }
                                        askForNewItem();
                                        break;
                                    case '4':
                                        if (order.items.length === 0) {
                                            console.log("No items to remove.");
                                            askQuestion();
                                        } else {
                                            order.items.forEach((item, index) => {
                                                console.log(`${index + 1}. ${item.name} ($${item.price} x ${item.quantity})`);
                                            });
                                            rl.question("Enter the number of the item you want to remove:\n", function(itemNumber) {
                                                const itemIndex = parseInt(itemNumber.trim()) - 1;
                                                if (itemIndex >= 0 && itemIndex < order.items.length) {
                                                    order.items.splice(itemIndex, 1);
                                                    order.subtotal = calculateSubtotal(order.items);
                                                    order.salesTax = calculateSalesTax(order.subtotal);
                                                    order.shipping = calculateShipping(order.subtotal);
                                                    order.total = calculateTotal(order.subtotal, order.salesTax, order.shipping);
                                                    console.log(`Order updated: ${order.name} - ${order.address} - ${order.items.map(item => `${item.name} ($${item.price} x ${item.quantity})`).join(', ')} - Subtotal: $${order.subtotal}, Sales Tax: $${order.salesTax}, Shipping: $${order.shipping}, Total: $${order.total}`);
                                                    askQuestion();
                                                } else {
                                                    console.log("Invalid item number.");
                                                    askQuestion();
                                                }
                                            });
                                        }
                                        break;
                                    default:
                                        console.log("Invalid selection. Please enter 1, 2, 3, or 4.");
                                        askQuestion();
                                }
                            });
                        } else {
                            console.log("Invalid order number.");
                            askQuestion();
                        }
                    });
                }
                break;
            case '3':
                console.log("Showing all orders...");
                if (orders.length === 0) {
                    console.log("No orders available.");
                } else {
                    orders.forEach((order, index) => {
                        console.log(`${index + 1}. ${order.name} - ${order.address} - ${order.items.map(item => `${item.name} ($${item.price} x ${item.quantity})`).join(', ')} - Subtotal: $${order.subtotal}, Sales Tax: $${order.salesTax}, Shipping: $${order.shipping}, Total: $${order.total}`);
                    });
                }
                askQuestion();
                break;
            case '4':
                console.log("Goodbye!");
                rl.close();
                break;
            default:
                console.log("Invalid selection. Please enter 1, 2, 3, or 4.");
                askQuestion();
        }
    });
}

askQuestion();