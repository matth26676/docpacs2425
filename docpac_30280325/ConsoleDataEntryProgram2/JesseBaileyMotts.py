orderList = []

while True:
    process = int(input('Do you wish to (1) Start A New Order, (2) Edit An Existing Order, or (3) Show All Orders? '))
    if process == 1:
        customerName = input('Enter customer name: ')
        customerAddress = input('Enter customer address: ')
        order = {
            'customerName': customerName,
            'customerAddress': customerAddress,
        }
        orderList.append(order)
    elif process == 2:
        for i in range(len(orderList)):
            print('Order', str(i + 1) + ':', orderList[i]['customerName'])
        orderIndex = int(input('Enter order number: ')) - 1
        if orderIndex >= len(orderList):
            print('Invalid order index')
            continue
        order = orderList[orderIndex]
        print('Your order is:', order)
        finishEditing = False
        while not finishEditing:
            editProcess = input('Do you wish to (1) Add an Item or (2) Finish Editing? ')
            if editProcess == '1':
                item = input('Enter item: ')
                order[item] = {}
                order[item]['quantity'] = int(input('Enter quantity: '))
                order[item]['price'] = float(input('Enter price: '))
            elif editProcess == '2':
                subtotal = 0
                for item in order:
                    if item != 'customerName' and item != 'customerAddress' and item != 'subtotal' and item != 'salesTax' and item != 'shipping' and item != 'total':
                        subtotal += order[item]['quantity'] * order[item]['price']
                order['subtotal'] = subtotal
                if subtotal < 50:
                    shipping = 5
                else:
                    shipping = 0
                salesTax = subtotal * 0.06
                order['salesTax'] = salesTax
                order['shipping'] = shipping
                order['total'] = subtotal + shipping + salesTax
                orderList[orderIndex] = order
                finishEditing = True
            pass
    elif process == 3:
        for order in orderList:
            print('Order:', order)
            print('Customer Name:', order['customerName'])
            print('Customer Address', order['customerAddress'])
            for item in order:
                if item != 'customerName' and item != 'customerAddress' and item != 'subtotal' and item != 'salesTax' and item != 'shipping' and item != 'total':
                    print('Item:', item)
                    print('Quantity:', order[item]['quantity'])
                    print('Price:', order[item]['price'])
            print('Subtotal:', order['subtotal'])
            print('Sales Tax:', order['salesTax'])
            print('Shipping Price:', order['shipping'])
            print('Total:', order['total'])
    pass