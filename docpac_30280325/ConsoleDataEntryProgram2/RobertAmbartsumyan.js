const prompt = require('prompt-sync')();

let orders = [];
let items = [
    { item: 'Widget A', unitprice: 5.00, retailprice: 10.00 },
    { item: 'Widget B', unitprice: 3.50, retailprice: 7.00 },
    { item: 'Widget C', unitprice: 2.00, retailprice: 5.00 },
    { item: 'Gadget X', unitprice: 8.00, retailprice: 15.00 },
    { item: 'Gadget Y', unitprice: 6.50, retailprice: 12.00 },
    { item: 'Tool Q', unitprice: 12.00, retailprice: 25.00 },
    { item: 'Tool R', unitprice: 10.00, retailprice: 20.00 }
];

while (true) {
    let orderChoice = prompt(' -- Would you like to 1: create order, 2: update order, 3: show order -- ');
    switch (orderChoice) {
        case '1':
            createOrder();
            break;
        case '2':
            updateOrder();
            break;
        case '3':
            showAllorders();
            break;
        case '4':
            process.exit();
        default:
            console.log('Invalid choice');
            break;
    }

    function showAllorders() {
        console.clear();
        if (orders.length === 0) {
            console.log('No orders available.');
            return;
        }

        orders.forEach((order, index) => {
            console.log(`Order ${index + 1}:`);
            console.log(`  Name: ${order.name}`);
            console.log(`  Address: ${order.address}`);
            console.log('  Items:');
            order.items.forEach((item, itemIndex) => {
                console.log(`    ${itemIndex + 1}: ${item.item}, Quantity: ${item.quantity}, Unit Price: ${item.unitprice.toFixed(2)}`);
            });
            console.log(`  Subtotal: ${order.unitSubtotal.toFixed(2)}`);
            console.log(`  Profit: ${order.profit.toFixed(2)}`);
            console.log(`  Sales Tax: ${order.tax.toFixed(2)}`);
            console.log(`  Total: ${order.total.toFixed(2)}`);
            console.log('-----------------------------');
        });
    }

    function createOrder() {
        let name = prompt('Enter name: ');
        let address = prompt('Enter address: ');

        let newOrder = {
            name: name,
            address: address,
            items: [],
            unitSubtotal: 0,
            tax: 0,
            retailSubtotal: 0,
            total: 0,
            profit: 0
        };

        orders.push(newOrder);
        console.clear();
    }

    function updateOrder() {
        if (orders.length === 0) {
            console.log('No orders available to update.');
            return;
        }

        let allOrders = orders.map((order, index) => {
            return `${index + 1}: ${order.name}, ${order.address}`;
        });

        console.log(allOrders.join('\n'));

        let orderIndex = parseInt(prompt('Enter the number of the order: '));

        let userChoice = prompt('Would you like to 1: add item, 2: finish editing: ');

        switch (userChoice) {
            case '1':
                addItem(orderIndex);
                break;
            case '2':
                finishEditing(orderIndex);
                break;
            default:
                console.log('Invalid choice');
                break;
        }

        function addItem(orderIndex) {
            console.clear();
            let allItems = items.map((item, index) => {
                return `${index + 1}: ${item.item}, Unit Price: ${item.unitprice}, Retail Price: ${item.retailprice}`;
            });
            console.log(allItems.join('\n'));

            let itemChoice = parseInt(prompt('Enter the number of the item: '));
            let quantity = parseInt(prompt('Enter the quantity: '));

            let item = items[itemChoice - 1];
            let order = orders[orderIndex - 1];

            let orderItem = {
                item: item.item,
                unitprice: item.unitprice,
                retailprice: item.retailprice,
                quantity: quantity,
                unitSubtotal: item.unitprice * quantity,
                retailSubtotal: item.retailprice * quantity,
                tax: 0.06 * (item.retailprice * quantity),
                total: (item.retailprice * quantity) + (0.06 * (item.retailprice * quantity)),
                profit: (item.retailprice - item.unitprice) * quantity
            };

            order.items.push(orderItem);
            order.unitSubtotal += orderItem.unitSubtotal;
            order.retailSubtotal += orderItem.retailSubtotal;
            order.tax += orderItem.tax;
            order.total += orderItem.total;
            order.profit += orderItem.profit;

            let moreItems = prompt('Would you like to add more items? (yes/no): ');
            if (order.total < 50) {
                order.total += 5;
                console.log('A shipping fee of $5 has been added as the total is less than $50.');
            }

            if (moreItems.toLowerCase() === 'yes') {
                addItem(orderIndex);
            } else {
                finishEditing(orderIndex);
            }
        }

        function finishEditing(orderIndex) {
            let order = orders[orderIndex - 1];
            console.log(`Name: ${order.name}`);
            console.log(`Address: ${order.address}`);
            console.log('Items:');
            order.items.forEach((item, index) => {
                console.log(`  ${index + 1}: ${item.item}, Quantity: ${item.quantity}, Total: ${item.total.toFixed(2)}`);
            });
            console.log(`Unit subtotal: ${order.unitSubtotal.toFixed(2)}`);
            console.log(`Tax: ${order.tax.toFixed(2)}`);
            console.log(`Retail subtotal: ${order.retailSubtotal.toFixed(2)}`);
            console.log(`Total: ${order.total.toFixed(2)}`);
            console.log(`Profit: ${order.profit.toFixed(2)}`);
        }
    }
}