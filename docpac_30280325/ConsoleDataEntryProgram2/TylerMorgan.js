const prompt = require('prompt-sync')();

var orders = [];
var order = { name: "", home: "", items: [], totals: {} }
while (true) {
    var Q1 = prompt("1:make new profile, 2:edit orders, 3:show all orders, 4:GET OUT | ")

    switch (Q1) {
        case "1":
            newUser()
            break;
        case "2":
            editOrder()
            break
        case "3":
            showOrders()
            break;
        case "4":
            return;
        default:
            console.log("nuh uh");
            break;
    }
}
function newUser() {
    var inputName = prompt("name for your order?")
    var inputHome = prompt("where is your FAKE house?")
    order.name = inputName
    order.home = inputHome
    orders.push(order)
}
function editOrder() {
    let names = []
    for (order in orders) {
        names.push(orders[order].name + (Number.parseInt(order) + 1))
    }
    console.log(names);

    var checkUser = prompt("which profile would you like to edit? (number plz) | ")
    var order = orders[Number.parseInt(checkUser) - 1]

    var Q2 = prompt("1:add items, 2:finish edit, 3:GET OUT | ")
    switch (Q2) {
        case "1":
            var item = {
                name: "",
                amount: 0,
                price: 0,
                retail: 0
            }

            item.name = prompt("what item would you like?")
            var newAmount = Number.parseFloat(prompt("how many?"))
            item.amount = newAmount
            var itemPrice = Number.parseFloat(prompt("how much is this item?"))
            item.price = itemPrice
            var retailPrice = Number.parseFloat(prompt("how much do we sell the item for?"))
            item.retail = retailPrice
            order.items.push(item)
            break;
        case "2":
                var profit = 0
                var subTotal = 0
                var shippingFee = 0
                var salesTax = 0
                var total = 0

            for (item of order.items) {
                let itemPrice = item.retail * item.amount
                subTotal += itemPrice

                let gain = item.retail - item.price
                profit += gain
            }
            salesTax = subTotal * .06
            salesTax = salesTax.toFixed(2)
            salesTax = Number.parseFloat(salesTax)
            if (subTotal < 50) {
                shippingFee = 5
            }
            
            total = subTotal + salesTax + shippingFee
            order.totals.profit = profit
            order.totals.subTotal = subTotal
            order.totals.shippingFee = shippingFee
            order.totals.salesTax = salesTax
            order.totals.total = total
            
            break;
        case "3":
            return;
        default:
            console.log("nuh uh");
            break;
    }
}
function showOrders() {

}
