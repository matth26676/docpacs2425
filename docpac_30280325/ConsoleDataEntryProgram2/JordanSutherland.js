let rl = require('readline-sync')

let orders = [
    {
        name: 'John Smith',
        address: '123 Maple St, Springfield, IL',
        items: [
            {name: 'Widget A', uPrice: 5, rPrice: 10, amount: 2},
            {name: 'Widget B', uPrice: 3.50, rPrice: 7, amount: 1},
            {name: 'Widget C', uPrice: 2, rPrice: 5, amount: 3}
        ]
    }
]

while (true) {
    switch (rl.keyInSelect(['Start a new order', 'Edit existing order', 'Show all orders'], 'Do you want to: ')) {
        case 0:
            newOrder()
            break
        case 1:
            editOrder()
            break
        case 2:
            showOrders()
            break
        case -1:
            return
    }
}

function newOrder() {
    let order = {
        name: rl.question("Insert Name: "),
        address: rl.question("Insert Address: "),
        items: []
    }
    orders.push(order)
}

function editOrder() {
    let selections = []
    for (let order of orders) {
        if (order.name) selections.push(order.name)
    }
    let order = orders[rl.keyInSelect(selections, 'Which Order?: ')]
    while (true) {
        switch (rl.keyInSelect(['Add Item', 'Finish Editing'], 'Select Option: ')) {
            case 0:
                order.items.push({
                    name: rl.question('What are you buying?: '),
                    amount: rl.questionInt('How many?: '),
                    uPrice: rl.questionInt('What is the unit price?: $'),
                    rPrice: rl.questionInt('What is the retail price?: $')
                })
                break
            case 1:
                totalOrders(order)
                console.log(order.totals)
                return
        }
    }
}

function totalOrders(order) {
    order['totals'] = {
        subtotal: 0,
        profit: 0,
        tax: 0,
        shipping: 0,
        total: 0
    }
    let uPrices = 0
    for (item of order.items) {
        order.totals.subtotal += item.rPrice * item.amount
        uPrices += item.uPrice * item.amount
    }
    order.totals.profit = order.totals.subtotal - uPrices
    order.totals.tax = order.totals.subtotal * .06
    if (order.totals.subtotal < 50) order.totals.shipping = 5
    order.totals.total = order.totals.subtotal + order.totals.tax + order.totals.shipping
    return
}

function showOrders() {
    for (let order of orders) {
        if (!order.totals) totalOrders(order)
        console.log(order)
    }
}