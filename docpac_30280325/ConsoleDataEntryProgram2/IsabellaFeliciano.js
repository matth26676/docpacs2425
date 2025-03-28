// download required modules
let rl = require('readline-sync');

let orders = []

while (true) {
    let order = {
        name: '',
        address: '',
        items: []
    };

    let selection = rl.keyInSelect(['Start A New Order', 'Edit Existing Order', 'Show All Orders'], 'Select an Option');

    // if the user selects to start a new order, we need to ask for their name and address
    switch (selection) {
        case 0:
            console.clear();
            order.name = rl.question('What is your name?');
            order.address = rl.question('What is your address?');
            orders.push(order);
            break;
        case 1:
            console.clear();
            let selection = [];
            for (let i = 0; i < Object.keys(orders).length; i++) {
                let lOrder = orders[i];
                selection.push(lOrder.name);
            }
            // if the user selects to edit an existing order, ask them which order they want to edit
            if (selection.length > 0) order = orders[rl.keyInSelect(selection, 'Which is yours?')];
            let editing = true
            while (editing) {
                console.clear();
                switch (rl.keyInSelect(['Add Item', 'Finish Editing'], 'Select an Option')) {
                    case 0:
                        console.clear();
                        let iName = rl.question('What is the name of this product?');
                        let iPrice = parseFloat(rl.question('What is around the price? (To facilate identifying your product)'));
                        let iAmount = parseFloat(rl.question('How many would you like?'));

                        let item = {
                            name: iName,
                            price: iPrice,
                            amount: iAmount
                        };

                        // Allows the same item to be added to the order
                        order.items.push(item);
                        break;
                    case 1:
                        console.clear();
                        let shipFee = 5;
                        let subtotal = 0;
                        order.items.forEach(item => {
                            subtotal += item.price * item.amount
                        });
                        order.subtotal = subtotal
                        let tax = subtotal * 0.06
                        order.tax = tax
                        if (subtotal + tax > 50) shipFee = 0
                        order.shippingFee = shipFee
                        editing = false
                        let total = subtotal + tax + shipFee
                        order.total = total
                        break;
                };
            };

            // Allows to see all the orders
            break;
        case 2:
            console.clear();
            console.log(orders);
            orders.forEach(tOrder => {
                console.log('');
                console.log(tOrder);
            });
            break;
    };
};