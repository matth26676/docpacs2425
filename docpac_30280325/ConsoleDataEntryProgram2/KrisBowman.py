class Order:
    def __init__(self, orderNum, name, address):
        self.orderNum = orderNum
        self.name = name
        self.address = address
        self.items = []
        self.subtotal = 0.00
        self.profit = 0.00
        self.tax = 0.00
        self.shipping = 0.00
        self.total = 0.00
        
    def addItem(self, item):
        self.items.append(item)
        self.calculations()
        
    def calculations(self):
        self.subtotal = sum(item.retailPrice * item.quantity for item in self.items)
        self.profit = sum((item.retailPrice - item.unitPrice) * item.quantity for item in self.items)
        self.tax = self.subtotal * 0.06
        self.shipping = 5.00 if self.subtotal < 50 else 0.00
        self.total = self.subtotal + self.tax + self.shipping
        
    def __str__(self):
        item_details = "\n".join(str(item) for item in self.items)
        return (f"Order #{self.orderNum}:\n"
            f"Name: {self.name}\n"
            f"Address: {self.address}\n"
            f"Items:\n{item_details}\n"
            f"Subtotal: ${self.subtotal:.2f}\n"
            f"Tax: ${self.tax:.2f}\n"
            f"Shipping: ${self.shipping:.2f}\n"
            f"Total: ${self.total:.2f}\n")
class Item:
    def __init__(self, name, quantity, unitPrice, retailPrice):
        self.name = name
        self.quantity = int(quantity)
        self.unitPrice = float(unitPrice)
        self.retailPrice = float(retailPrice)
    def __str__(self):
        return (f"{self.name} x {self.quantity}\n"
                f"Unit Price: ${self.unitPrice:.2f}\n"
                f"Retail Price: ${self.retailPrice:.2f}\n")
    
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
                    selected = orders[num - 1]
                    print("Selected: ", selected)
                    option2 = int(input("What would you like to do? \n 1) Add an Item \n 2) Finish Editing \n"))
                    if option2 == 1:
                        print("Selected: Add an Item. \n ")
                        name = input("Please enter the item's name: \n")
                        quantity = input("How many would you like to add? \n")
                        unitPrice = input("What is the unit price? \n $")
                        retailPrice = input("What is the retail price? \n $")
                        newItem = Item(name, quantity, unitPrice, retailPrice)
                        orders[num - 1].items.append(newItem)
                        selected.addItem(newItem)
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
                print(order)
        else:
            print("No orders to display.")
    else:
        print("Invalid input. Please enter 1, 2, or 3.")
        