const prompt = require('prompt-sync')();

const SALES_TAX = 0.06;
const SHIPPING = 5;

const items = [
    {name: 'Widget A', unitPrice: 5.0, retailPrice: 10.0},
    {name: 'Widget B', unitPrice: 3.5, retailPrice: 7.0 },
    {name: 'Widget C', unitPrice: 2.0, retailPrice: 5.0},
    {name: 'Gadget X', unitPrice: 8.0, retailPrice: 15.0},
    {name: 'Gadget Y', unitPrice: 6.5, retailPrice: 12.0},
    {name: 'Tool Q', unitPrice: 12.0, retailPrice: 25.0},
    {name: 'Tool R', unitPrice: 10.0, retailPrice: 20.0},
];


let orders = [];

function main() {

    console.log('Console Data Entry Program V2.0');

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
                order.totals = totals
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
            let item = items[orderItem.itemID];
            console.log(`${item.name} $${item.retailPrice} x ${orderItem.quantity}`);
        });
        console.log(`Subtotal: $${order.totals.subTotal}`);
        console.log(`Shipping: $${order.totals.shipping}`);
        console.log(`Tax: $${order.totals.tax}`);
        console.log(`Profit: $${order.totals.profit}`);
        console.log(`Total: $${order.totals.total}`);
        console.log('---------------------');
    });
}

function addItem(order) {
    items.forEach((item, itemID) => {
        console.log(`${itemID}: ${item.name} $${item.retailPrice}`);
    });

    let selection = prompt('Select Item to Add: ');
    let item = items[selection];

    let quantity = prompt('Enter Quantity: ');

    order.items.push({ 
        itemID: selection,
        quantity: quantity,
        unitPrice: item.unitPrice,
        retailPrice: item.retailPrice
    });
}

function calculateOrderTotals(order) {
    let totals = {
        subTotal: 0,
        shipping: 0,
        tax: 0,
        unitTotal: 0,
        profit: 0,
        total: 0
    };

    order.items.forEach(orderItem => {
        let item = items[orderItem.itemID];
        totals.unitTotal += item.unitPrice * orderItem.quantity;
        totals.subTotal += item.retailPrice * orderItem.quantity;
    });

    if (totals.subTotal < 50) {
        totals.shipping = SHIPPING;
    }

    totals.tax = Number((totals.subTotal * SALES_TAX).toFixed(2));
    totals.profit = totals.subTotal - totals.unitTotal;
    totals.total = totals.subTotal + totals.shipping + totals.tax;

    return totals;
}

main();