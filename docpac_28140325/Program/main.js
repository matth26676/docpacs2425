const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let orders = [];

const items = [
    { name: 'Wireless Mouse', price: 15.00 },
    { name: 'USB-C Cable', price: 8.00 },
    { name: 'Notebook', price: 12.00 },
    { name: 'Desk Lamp', price: 25.00 },
    { name: 'Bluetooth Speaker', price: 40.00 },
    { name: 'Phone Stand', price: 40.00 },
    { name: 'Pen Set', price: 5.00 }
];

function buyItem() {
    console.log(" 1. Wireless Mouse Unit Price: $15.00 \n 2. USB-C Cable Unit Price: $8.00 \n 3. Notebook Unit Price: $12.00 \n 4. Desk Lamp Unit Price: $25.00 \n 5. Bluetooth Speaker Unit Price: $40.00 \n 6. Phone Stand Unit Price: $40.00 \n 7. Pen Set Unit Price: $5.00 \n");
    rl.question('What item would you like to add? ', (answer) => {
        let itemIndex = (answer) - 1;
        let item = items[itemIndex];
        if (!item) {
            console.log("Invalid item number.\n");
            buyItem();
            return;
        }

        rl.question('How many would you like to buy? ', (quantity) => {
            let order = orders[orders.length - 1];
            if (!order.items) {
                order.items = [];
            }

            order.items.push({ ...item, quantity: parseInt(quantity) });
            console.log("Item added successfully!\n");
            buyItem();
        });
    });
}

function mainMenu() {
    rl.write(" \n 1. Start A New Order \n 2. Edit Existing Order \n 3. Show All Orders. \n")

    rl.question('\n What would you like to do? ', (answer) => {
        switch (answer.trim()) {  
            case '1':
                rl.question('What is your name? ', (name) => {
                    let order = { name };
                    rl.question('What is your address? ', (address) => {
                        order.address = address;
                        orders.push(order);
                        console.log("Order added successfully!\n");
                        mainMenu();
                    });
                });
                break;

            case '2':
                if (orders.length === 0) {
                    console.log(" \n No orders to edit.");
                    mainMenu();
                    break;
                }

                orders.forEach((order, index) => {
                    console.log(`${index + 1}. ${order.name}`);
                });

                rl.question('Which order would you like to edit? ', (orderNumber) => {
                    let orderIndex = (orderNumber) - 1;
                    let order = orders[orderIndex];

                    if (!order) {
                        console.log("Invalid order number.\n");
                        mainMenu();
                        return;
                    }

                    rl.question('Would you like to \n 1. Add an Item \n 2. Finish Editing \n ', (answer) => {
                        switch (answer.trim()) {
                            case '1':
                                buyItem();
                                break;
                            case '2':
                                console.log("Finished editing");

                                break;
                            default:
                                console.log('Please enter a valid option (1 or 2).\n');
                                mainMenu();
                        }
                    });
                });
                break;

            case '3':
              
                break;

            default:
                console.log('Please enter a valid option (1, 2, or 3).\n');
                mainMenu();
        }
    });
}

mainMenu();
