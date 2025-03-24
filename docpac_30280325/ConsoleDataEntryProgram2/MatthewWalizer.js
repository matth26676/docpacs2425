const readLineSync = require('readline-sync');
var orders = [];
var answerToQuestion = '';

function startNewOrder() {
    // create an empty order object
    let order = {};
    // ask for the user to input the name and address of the customer and add these responses as properties to the order object
    answerToQuestion = readLineSync.question('What is the customer\'s name? ');
    order.customerName = answerToQuestion;
    console.clear()
    answerToQuestion = readLineSync.question('What is the customer\'s address? ');
    order.customerAddress = answerToQuestion;
    // append the order object to the orders array
    orders.push(order);
    // return the user to the main program
    return;
}

function editExistingOrder() {
    var currentlyEditing = true;
    while (currentlyEditing) {
        console.clear()
        // ask the user if they want to add an item or finish editing
        console.log('1. Add an item \n2. Finish editing');
        answerToQuestion = readLineSync.question('What would you like to do? ');
        switch (answerToQuestion) {
            case '1':
                console.clear()
                // prepares an item object
                let item = {};
                // list every order in the orders array, numbered, starting at one.
                for (let i = 0; i < orders.length; i++) {
                    console.log(`${i + 1}. ${orders[i].customerName}`);
                }
                // ask the user to select an order by number
                answerToQuestion = readLineSync.question('Which order would you like to edit? ');
                let order = orders[parseInt(answerToQuestion) - 1];
                console.clear()
                // gets the name of the item that is being added from the user and appends the information to the item object
                answerToQuestion = readLineSync.question('What is the name of the item you would like to add? ');
                item.name = answerToQuestion;
                console.clear()
                // gets the quantity of the item that is being added from the user and appends the information to the item object
                answerToQuestion = readLineSync.question('How much of this item does the order request for? ')
                item.quantity = parseInt(answerToQuestion);
                console.clear()
                // gets the unit price of the item that is being added from the user and appends the information to the item object
                answerToQuestion = readLineSync.question('What is the unit price of this item? $');
                item.unitPrice = parseFloat(answerToQuestion);
                item.unitPrice = parseFloat(item.unitPrice.toFixed(2));
                console.clear()
                // gets the retail price of the item that is being added from the user and appends the information to the item object
                answerToQuestion = readLineSync.question('What is the retail price of this item? $');
                item.retailPrice = parseFloat(answerToQuestion);
                item.retailPrice = parseFloat(item.retailPrice.toFixed(2));
                // adds the item to the items array and makes the array a property of the order object
                if (order.items) {
                    order.items.push(item);
                } else {
                    order.items = [item];
                }
                // return the user to selecting an order
                break;
            case '2':
                // set currentlyEditing to false to exit the loop
                currentlyEditing = false;
                orders.forEach(order => {
                    order.items.forEach(item => {
                        // initilizes the order's subtotal and profit properties if they don't exist
                        if (!order.subtotal) {
                            order.subtotal = 0
                        };
                        if (!order.profit) {
                            order.profit = 0
                        };
                        // adds the current item's retail price times the item's quantity to the order's subtotal
                        order.subtotal += item.retailPrice * item.quantity;
                        order.subtotal = parseFloat(order.subtotal.toFixed(2));
                        // takes away the item's unit price times the item's quantity to the order's profit
                        order.profit -= item.unitPrice * item.quantity
                        // calculates the orders current sales tax
                        order.salesTax = order.subtotal * 0.06;
                        order.salesTax = parseFloat(order.salesTax.toFixed(2));
                        // sees if the current order's subtotal is above 50 and if it is it makes shipping free, else it makes shipping $5.00
                        if (order.subtotal < 50) {
                            order.shippingFee = 5.00;
                        } else {
                            order.shippingFee = 0.00;
                        };
                        order.shippingFee = parseFloat(order.shippingFee.toFixed(2));
                        // gets the current order's total based on the current subtotal, sales tax, and shipping fee of the order
                        order.total = order.subtotal + order.salesTax + order.shippingFee
                        order.total = parseFloat(order.total.toFixed(2))
                    });
                    // adds the final subtotal to the profit to get the final numbers for profit
                    order.profit += order.subtotal
                });
                break;
        }
    }
}

function showAllOrders() {
    // gets each order in the orders array
    for (order in orders) {
        // displays the customer name and address to the user
        console.log('Order ' + (parseInt(order) + 1) + ': \n\nCustomer Information: \n\n Customer Name: ' + orders[order].customerName + '\n Customer Address: ' + orders[order].customerAddress + '\n\nItems Ordered: ')
        // displays all the items' name, quantity, and unit price in the order to the user
        orders[order].items.forEach(item => {
            console.log('\n Item Name: ' + item.name + '\n Item Quantity: ' + item.quantity + '\n Unit Price: $' + item.unitPrice.toFixed(2) + '\n');
        });
        // displays the subtotal, profit, sales tax, shipping, and the total of the order to the user
        console.log('Sub Total: $' + orders[order].subtotal.toFixed(2) + '\nProfit: $' + orders[order].profit.toFixed(2) + '\nSales Tax: $' + orders[order].salesTax.toFixed(2) + '\nShipping: $' + orders[order].shippingFee.toFixed(2) + '\nTotal: $' + orders[order].total.toFixed(2));
        if (parseInt(order) + 1 != orders.length) {
            console.log('------------------------------');
        } else {
            console.log('==============================');
        };
    }
    readLineSync.question('Press Enter to continue...')
    console.clear()
}

while (true) {
    console.clear()
    console.log('1. Start a new order \n2. Edit an existing order \n3. Show all orders');
    answerToQuestion = readLineSync.question('What would you like to do? ');
    switch (answerToQuestion) {
        case '1':
            console.clear()
            startNewOrder();
            break;
        case '2':
            editExistingOrder();
            break;
        case '3':
            console.clear()
            showAllOrders();
            break;
    }
}