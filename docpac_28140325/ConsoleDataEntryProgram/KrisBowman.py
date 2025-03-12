class Order:
    def __init__(self, orderNum, name, address):
        self.orderNum = orderNum
        self.name = name
        self.address = address
        self.items = []
    def __str__(self):
        return f"Order #{self.orderNum}: \n {self.name} \n {self.address} \n {self.items}"

class Item:
    def __init__(self, name, quantity, price):
        self.name = name
        self.quantity = int(quantity)
        self.price = float(price)
    def __str__(self):
        return f"{self.name} * {self.quantity}, ${self.price}"
    
orders = []

#main loop
while True:
        option1 = int(input("\n What would you like to do? \n 1) Start a New Order \n 2) Edit an Existing Order \n 3) Show All Orders \n"))
        if option1 == 1:
            print("Selected: Start a New Order. \n ")
            orderNum = len(orders) + 1
            name = input("Please enter a name for the order: \n")
            address = input("Please enter an address for the order: \n")
            newOrder = Order(orderNum, name, address)
            orders.append(newOrder)
            print("Order complete. Returning to home...")
        elif option1 == 2:
            ("Selected: Edit Existing Order. \n ")
            if len(orders) != 0:
                for order in orders:
                    print(order)
                num = int(input("\n Enter an order number to edit: \n"))
                if num <= len(orders):
                    print("Selected: ", orders[num - 1])
                    option2 = int(input("What would you like to do? \n 1) Add an Item \n 2) Finish Editing \n"))
                    if option2 == 1:
                        print("Selected: Add an Item. \n ")
                        name = input("Please enter the item's name: \n")
                        quantity = input("How many would you like to add? \n")
                        price = input("How much does one cost? \n $")
                        newItem = Item(name, quantity, price)
                        orders[num - 1].items.append(newItem)
                    elif option2 == 2:
                        print("Selected: Finish Editing. \n Returning to home...")
                    else:
                        print("Invalid input. Please enter 1 or 2.")
                else:
                    print("Invalid order number.")
            else:
                print("No orders to display.")
        elif option1 == 3:
            print("Selected: Show All Orders. \n")
            if len(orders) != 0:
                for order in orders:
                    subtotal = sum(item.price * item.quantity for item in order.items)
                    tax = subtotal * 0.06
                    shipping = 5.00
                    total = subtotal + tax + shipping
                    print(order, "\n Subtotal: $", subtotal, "\n Sales Tax: $", tax, "\n Shipping: $", shipping, "\n \n Total:", total)
            else:
                print("No orders to display.")
        else:
            print("Invalid input. Please enter 1, 2, or 3.")
        