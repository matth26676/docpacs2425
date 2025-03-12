const prompt = require('prompt-sync')();

let orders = [];

while (true) {
    let userChoice = prompt('1: NewOrder, 2: EditOrder, 3: ShowOder: ');

    // Switch case for user choice
    switch (Number(userChoice)) {
        case 1:
            newOrder();
            break;
        case 2:
            editOrder();
            break;
        case 3:
            showOrder();
            break;
        case 4:
            return;
        default:
            console.log('Invalid option');
            break;
    }

    // Functions for cases
    function roundToNearestHundredth(num) {
        return Math.round(num * 100) / 100;
    }

    function newOrder() {
        let user_name = prompt('Enter your name: ');
        let user_address = prompt('Enter your address: ');
        let user_item = prompt('Enter the item you want to order: ');
        let user_quantity = prompt('Enter the quantity: ');
        let user_price = prompt('Enter the price: ');

        let newOrder = {
            name: user_name,
            address: user_address,
            item: user_item,
            quantity: Number(user_quantity),
            price: Number(user_price),
        };

        orders.push(newOrder);
        console.clear();
    }

    function editOrder() {
        let allOrders = orders.map((order, index) => {
            return `${index + 1}: ${order.name}, ${order.address}, ${order.item}, ${order.quantity}, ${order.price} `;
        });
        console.log(`All Orders: ${allOrders}`);
        let order_number = prompt('Enter the order number you want to edit: ');
        let order = orders[Number(order_number) - 1];

        console.log('Please refill in ALL the data for the order.');

        // Update the data
        let user_name = prompt('Enter your name: ');
        let user_address = prompt('Enter your address: ');
        let user_item = prompt('Enter the item you want to order: ');
        let user_quantity = prompt('Enter the quantity: ');
        let user_price = prompt('Enter the price: ');

        order.name = user_name;
        order.address = user_address;
        order.item = user_item;
        order.quantity = Number(user_quantity);
        order.price = Number(user_price);

        orders[Number(order_number) - 1] = order;

        let user_choice = prompt('Would you like to 1: add new item, 2: keep editing, or 3: finish editing? ');

        if (Number(user_choice) === 1) {
            newOrder();
        } else if (Number(user_choice) === 2) {
            editOrder();
            console.clear();
        } else {
            let orderTotals = 0;
            let shipping = 5;

            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let subTotal = order.quantity * order.price;
                orderTotals += subTotal;
            }

            let subTotal = orderTotals;
            let tax = subTotal * 0.06;

            if (subTotal < 50) {
                subTotal += shipping;
                console.log('Shipping + $5');
            }

            let total = subTotal + tax;

            order.subTotal = Number(subTotal);
            order.tax = roundToNearestHundredth(Number(tax));
            order.total = roundToNearestHundredth(Number(total));

            console.log('Subtotal: ', subTotal);
            console.log('Tax: ', tax);
            console.log('Total: ', total);
        }
    }

    function showOrder() {
        for (let i = 0; i < orders.length; i++) {
            let order = orders[i];
            console.log('');
            console.log(`Order ${i + 1}:`);
            console.log(`Name: ${order.name}`);
            console.log(`Address: ${order.address}`);
            console.log(`Item: ${order.item}`);
            console.log(`Quantity: ${order.quantity}`);
            let unitprice = order.price / order.quantity;
            console.log('___________________________');
            console.log(`Unit Price: ${roundToNearestHundredth(unitprice)}`);
            let subTotal = order.price;
            console.log(`Subtotal: ${subTotal}`);
            let tax = subTotal * 0.06;
            console.log(`Tax: ${roundToNearestHundredth(tax)}`);
            let total = subTotal + tax;
            console.log('___________________________');
            console.log(`Total: ${roundToNearestHundredth(total)}`);
            console.log('');
        }

        let response = prompt('Main menu? (y/n): ');
        if (response === 'y') {
            console.clear();
        } else {
            console.clear();
            showOrder();
        }
    }
}