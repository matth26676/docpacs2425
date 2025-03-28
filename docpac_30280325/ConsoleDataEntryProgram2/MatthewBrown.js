const readlineSync = require('readline-sync');

var orders = []

ordering = true

while (ordering) {

    console.log('New Order (1), Edit Order (2), Show Order (3) \n');

    let userInput = readlineSync.question('1 / 2 / 3 \n')

    switch (userInput) {
        case "1":
            let userName = readlineSync.question('\nWhats your name? \n')
            let userAddress = readlineSync.question('Whats your address \n')
            let uOrder = [userName, userAddress]

            orders.push(uOrder)

            break;

        case "2":
            orders.forEach(element => {
                let tempIndex = orders.indexOf(element)
                tempIndex++
                console.log(element + '\n' + tempIndex);
            });

            let userInput = readlineSync.question('Enter index of your order \n')
            tempIndex = userInput - 1

            console.log(orders[tempIndex]);

            userInput = readlineSync.question('Add Item (1), Finish Edit (2) \n')

            if (userInput == "1") {
                let itemName = readlineSync.question('Product Name \n')
                let itemPrice = readlineSync.question('Price\n')
                itemPrice = parseFloat(itemPrice)
                let itemQuantity = readlineSync.question('How many\n')
                itemQuantity = parseInt(itemQuantity)
                let uName = orders[tempIndex].at(0)

                console.log(uName);

                console.log(itemName);

                let tempOrder = { name: uName, item: itemName, price: itemPrice, quantity: itemQuantity }

                console.log(tempOrder);

                orders[tempIndex].push(tempOrder)

                console.log(orders);


            }

            break;

        case "3":
            orders.forEach(element => {
                let tempIndex = orders.indexOf(element)
                tempIndex++
                console.log(element + '\n' + tempIndex);
            });

            let tempInput = readlineSync.question('Enter index of your order \n')
            tempIndex = tempInput - 1

            console.log(orders[tempIndex]);

            let counter = 0
            let uName = orders[tempIndex].at(0)
            let uAddress = orders[tempIndex].at(1)
            var subTotal = 0
            var profit = 0

            orders[tempIndex].forEach(element => {
                if (counter < 2) {
                    counter++
                } else {
                    counter++
                    subTotal = subTotal + (element.price * element.quantity)
                    profit = profit + element.price
                }

            });

            console.log(`Name: ${uName}\n`);
            console.log(`Address: ${uAddress}\n`);
            console.log(`Profit: ${(subTotal - profit).toFixed(2)}\n`);
            console.log(`Taxes: ${(subTotal * 0.06).toFixed(2)}\n`);
            console.log(`Subtotal + Taxes: ${(subTotal + (subTotal * 0.06)).toFixed(2)}\n`);
            if ((subTotal + ((subTotal * 0.06)).toFixed(2)) < 50) {
                console.log("Shipping: 5.00");
                console.log(`Subtotal + Taxes + Shipping: ${(subTotal + (subTotal * 0.06) + 5).toFixed(2)}\n`);
            }


            break;

        default:
            break;
    }

}