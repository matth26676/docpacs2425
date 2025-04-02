const prompt = require('prompt-sync')();

var orders = [];
var items = [];
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
    var order = { name: "", home: "", items:[] }
    order.name = inputName
    order.home = inputHome
    orders.push(order)
}
function editOrder() {
    let names = []
    for (order in orders) {
        names.push(orders[order].name + (Number.parseInt(order)+1))
    }
    console.log(names);
    
    var checkUser = prompt("which profile would you like to edit? (number plz) | ")
    var order = orders[Number.parseInt(checkUser) -1]
    
    var Q2 = prompt("1:add items, 2:finish edit, 3:GET OUT | ")
    switch (Q2) {
        case "1":
            var item = {
                name:"",
                amount:0,
                price:0,
                retail:0
            }
            item.name = prompt("what item would you like?")
            var newAmount = Number.parseFloat(prompt("how many?"))
            item.amount = newAmount
            var itemPrice = Number.parseFloat(prompt("how much is this item?"))
            item.price = itemPrice
            var retailPrice = Number.parseFloat(prompt("how much do we sell the item for?"))
            item.retail = retailPrice
            order.items = item
            console.log(orders);
            break;
        case "2":
            var profit = 0
            var subTotal = 0
            var shippingFee = 0
            var salesTax = 0
            order.items.forEach(addItems());
            break;
        case "3":
            return;
        default:
            console.log("nuh uh");
            break;
    }
    function addItems() {
        //add retail price of item by quantity
        var itemPrice = orders.items.retail * orders.items.amount
        //add itemPrice to subTotal 
        console.log(itemPrice);
        //multiply subtotal by .06
        //assign the value to salesTax
    }
}
function showOrders() {
    
}
