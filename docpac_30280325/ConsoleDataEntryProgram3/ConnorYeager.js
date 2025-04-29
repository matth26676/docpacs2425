const readlineSync = require('readline-sync');

let orders = [];

while (true) {
    const response = readlineSync.question('(1) Start a new order? (2) Edit existing order? (3) View all orders? ');

    if (response === '1') {
        const name = readlineSync.question('Enter your name: ');
        const address = readlineSync.question('Enter your totally real address: ');
        const order = { name, address };
        orders.push(order);
    } else if (response === '2') {
        if (orders.length === 0) {
            console.log('No orders to edit.');
            continue;
        }
        console.log('Existing orders:');
        orders.forEach((order, index) => {
            console.log(`${index}: ${order.name}, ${order.address}`);
        });
        const orderIndex = readlineSync.question('Enter the index of the order you want to edit: ');
        if (orderIndex >= 0 && orderIndex < orders.length) {
            const editResponse = readlineSync.question('(1) Add an item? (2) Finish editing?: ');
            if (editResponse === '1') {
                 items = [WidgetA, WidgetB, WidgetC];
            const item = readlineSync.question('Enter the item to add: ');
            if (!orders[orderIndex].items) {
                orders[orderIndex].items = [];
            }
            orders[orderIndex].items.push(item);
            } else if (editResponse === '2') {}
        } 
    } else if (response === '3') {
        console.log(orders);
    } else {
        console.log('Invalid response');
    }
}
