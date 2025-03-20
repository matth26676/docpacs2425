const readline = require("readline")
const { stdin: input, stdout: output } = require('process');

var interface = readline.createInterface({
    input, output
})

let orders = [];

function addItem(order) {
        interface.write(" \n 1. Add Item \n 2. Finish Editing \n")
        interface.question("What would you like to do? ", (answer) => {
                switch (answer) {
                    case "1":
                        let item = {}
                        interface.question("Enter Item Name: ", (answer) => {
                            item.name = answer
                            interface.question("Enter Item Price: ", (answer) => {
                                item.price = answer
                                interface.question("Enter Item Quantity: ", (answer) => {
                                    item.quantity = answer
                                    order.items.push(item)
                                    console.log(order)
                                    addItem(order)
                                })
                            })
                        })
                        break;
                    case "2":
                        let subtotal = 0;
                        let sales_tax = 0;
                        let shipping = 0;
                        let total = 0;
                        order.items.forEach(item => {
                            subtotal += item.price * item.quantity
                        })
                        console.log(subtotal)
                        sales_tax = subtotal * 0.06
                        if (subtotal < 50) {
                            shipping = 5
                        }
                        total = subtotal + sales_tax + shipping
                        order.subtotal = subtotal
                        order.sales_tax = sales_tax
                        order.shipping = shipping
                        order.total = total

                        run()
                        break;
                }
            })
}


function run() {
    interface.write(" 1. Start New Order \n 2. Edit Existing Order \n 3. Show All Orders \n")
    
    interface.question('What would you like to do? ', function (answer) {
        console.log('You answered ' + answer)
        switch (answer) {
            case "1":
                interface.question("Enter Name: ", (answer) => {
                    username = answer
                    interface.question("Enter Address: ", (answer) => {
                        address = answer
                        orders.push({
                            name: username,
                            address: address,
                            items: []
                        })
                        run()
                    })
                })
                break;
            case "2":
                for (let i = 0; i < orders.length; i++) {
                    interface.write(" " + (i + 1) + ". " + orders[i].name + ": " + orders[i].address + "\n")
                }
                interface.question("Select Order to Edit: ", (answer) => {
                    let order = orders[answer - 1]
                    if (answer <= orders.length) {
                        addItem(order)
                    }
                })
                break;
            case "3":
                orders.forEach((order, index) => {
                    interface.write((index + 1) + ". " + order.name + ": " + order.address + "\n")
                    order.items.forEach((item, index) => {
                        interface.write(" Items: \n")
                        interface.write("   " + (index + 1) + ". " + item.name + ": $" + item.price + " x " + item.quantity + "\n")
                    })
                    interface.write(" Subtotal: $" + order.subtotal + "\n")
                    interface.write(" Sales Tax: $" + order.sales_tax + "\n")
                    interface.write(" Shipping: $" + order.shipping + "\n")
                    interface.write(" Total: $" + order.total + "\n")
                })
                run()
                break;
        }
    })
}

run()