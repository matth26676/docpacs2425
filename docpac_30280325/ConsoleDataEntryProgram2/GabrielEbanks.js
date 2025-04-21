const readline = require('readline');
const { stdin: input, stdout: output } = require('process');


const rl = readline.createInterface({ input, output });

orders = [];


function newOrder() {
    rl.question('What is your name? ', (name) => {
        rl.question('What is your adress? ', (address) => {
            let order = { name: name, address: address };
            order.items = [];
            orders.push(order);
            mainMenu();
        })
    })
}

function addItemToOrder (index) {
    rl.question('What item would you like to add? ', (itemName) => {
        rl.question('How many would you like to add? ', (quantity) => {
            rl.question('What is the Unit Price? ', (unitPrice) => {
                rl.question('What is the Retail Price? ', (retailPrice) => {
                    let item = {name: itemName, quantity: parseFloat(quantity), unitPrice: parseFloat(unitPrice), retailPrice: parseFloat(retailPrice) };
                    orders[index].items.push(item);
                    console.log(orders[index]);
                    editOrder(index);
                })
            })
        })
    })
}

function orderCalculate(index) {
    let subtotal = 0;
    let totalUnitPrice = 0;
    
    orders[index].items.forEach(item => {
        subtotal += item.retailPrice * item.quantity;
        totalUnitPrice += item.unitPrice * item.quantity;
    });

    let profit = subtotal - totalUnitPrice;
    let tax = Number(parseFloat(subtotal * 0.07).toFixed(2));

    if (subtotal < 50) {
        shippingCost = 5
    }
    else {
        shippingCost = 0;
    }
    let total = subtotal + tax + shippingCost;

    orders[index].subtotal = subtotal;
    orders[index].unitPrice = totalUnitPrice;
    orders[index].profit = profit;
    orders[index].tax = tax;
    orders[index].shippingCost = shippingCost;
    orders[index].total = total;

    console.log(orders[index]);
    mainMenu();
}

function editOrder(index) {
    rl.write('1. Add Item\n2. Finish Editiing\n');
    rl.question('Please select an option: ', (option) => {
        switch (option) {
            case '1':
                addItemToOrder(index);
                break;
            case '2':
                orderCalculate(index);
                break;
            default:
                console.log('Invalid option, please try again.');
                editOrder();
        }
    })
}

function editOrderMenu() {
    orders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.name}`);
    });

    rl.question('Select the order number you want to edit: ', (orderNumber) => {
        const index = orderNumber - 1;
        if (index >= 0 && index < orders.length) {
            editOrder(index);
        } else {
            console.log('Invalid order number, please try again.');
            editOrderMenu();
        }
    })
}

function showAllOrders() {
    orders.forEach((order, index) => {
        rl.write(`${index + 1}. ${order.name} - ${order.address}\n`);
        rl.write('Items:\n');
        order.items.forEach((item, i) => {
            rl.write(`${i + 1}. ${item.name} - ${item.quantity} x ${item.unitPrice} (Retail: ${item.retailPrice})\n`);
        });
            rl.write(`Subtotal: ${order.subtotal}\n`);
            rl.write(`Profit: ${order.profit}\n`);
            rl.write(`Tax: ${order.tax}\n`);
            rl.write(`Shipping Cost: ${order.shippingCost}\n`);
            rl.write(`Total: ${order.total}\n`);

    });
    mainMenu();
}

function mainMenu() {
    rl.write('1. Start a new order\n2. Edit Existing Order\n3. Show All Orders\n');
    rl.question('Please select an option: ', (option) => {
        switch (option) {
            case '1':
                newOrder();
                break;
            case '2':
                editOrderMenu();
                break;
            case '3':
                showAllOrders();
                break;
            default:
                console.log('Invalid option, please try again.');
                mainMenu();
        }
    })
}

mainMenu();