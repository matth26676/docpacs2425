const prompt = require('prompt-sync')();

const SALES_TAX = 0.06;
const SHIPPING = 5;

const items = [
    { id: 1, name: 'Item 1', price: 10.0 },
    { id: 2, name: 'Item 2', price: 20.0 },
    { id: 3, name: 'Item 3', price: 30.0 },
    { id: 4, name: 'Item 4', price: 40.0 },
    { id: 5, name: 'Item 5', price: 50.0 }
];


let orders = [];

function main() {

    console.log('Console Data Entry Program V1.0');

    while (true) {
        console.log('1: Start Order  2: Edit Order  3: Show All Orders');
        let selection = prompt('? ');
        switch (selection) {
            case '1':
                newOrder();
                break;
            case '2':
                editOrder();
                break;
            case '3':
                showOrders();
                break;
            default:
                console.log('Invalid Selection');
                break;
        }
    }
}

function newOrder() {

    let order = {
        name: prompt('Enter Customer Name: '),
        address: prompt('Enter Customer Address: '),
        items: []
    };

    orders.push(order); 

}

function editOrder() {
    orders.forEach((order, index) => {
        console.log(`${index + 1}: ${order.name}`);
    });

    let selection = prompt('Select Order to Edit: ');
    let order = orders[selection - 1];

    while (true) {
        console.log('1: Add Item  2: Finish Editing');
        let selection = prompt('? ');
        switch (selection) {
            case '1':
                addItem(order);
                break;
            case '2':
                let totals = calculateOrderTotals(order);
                order.subTotal = totals.subTotal;
                order.shipping = totals.shipping;
                order.tax = totals.tax;
                order.total = totals.total;
                return;
            default:
                console.log('Invalid Selection');
                break;
        }
    }
}

function showOrders() {
    orders.forEach(order => {
        console.log('---------------------');
        console.log(`Name: ${order.name}`);
        console.log(`Address: ${order.address}`);
        console.log('Items:');
        order.items.forEach(orderItem => {
            let item = items.find(x => x.id == orderItem.itemID);
            console.log(`${item.name} $${item.price} x ${orderItem.quantity}`);
        });
        console.log(`Subtotal: $${order.subTotal}`);
        console.log(`Shipping: $${order.shipping}`);
        console.log(`Tax: $${order.tax}`);
        console.log(`Total: $${order.total}`);
        console.log('---------------------');
    });
}

function addItem(order) {
    items.forEach(item => {
        console.log(`${item.id}: ${item.name} $${item.price}`);
    });

    let selection = prompt('Select Item to Add: ');
    let item = items[selection - 1];

    let quantity = prompt('Enter Quantity: ');

    order.items.push({ itemID: item.id, quantity: quantity});
}

function calculateOrderTotals(order) {
    let totals = {
        subTotal: 0,
        shipping: 0,
        tax: 0,
        total: 0
    };
    order.items.forEach(orderItem => {
        let item = items.find(x => x.id == orderItem.itemID);
        totals.subTotal += item.price * orderItem.quantity;
    });

    if (totals.subTotal < 50) {
        totals.shipping = SHIPPING;
    }

    totals.tax = totals.subTotal * SALES_TAX;

    totals.total = totals.subTotal + totals.shipping + totals.tax;

    return totals;
}

main();