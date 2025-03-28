orders = []

def new_order():
    name = input("Enter customer's name: ")
    address = input("Enter customer's address: ")
    order = {
        "name": name,
        "address": address,
        "items": []
    }
    orders.append(order)
    print("New order added!\n")

def edit_order():
    if not orders:
        print("No orders available to edit.\n")
        return

    print("Existing Orders:")
    for i, order in enumerate(orders, 1):
        print(f"{i}. {order['name']} - {order['address']}")
    
    try:
        choice = int(input("Enter the order number you wish to edit: "))
        selected_order = orders[choice - 1]
    except (ValueError, IndexError):
        print("Invalid order selection.\n")
        return

    while True:
        print("\nEditing Order for:", selected_order["name"])
        print("1. Add an Item")
        print("2. Finish Editing")
        edit_choice = input("Enter your choice: ")

        if edit_choice == "1":
            item_name = input("Enter item name: ")
            try:
                quantity = int(input("Enter quantity: "))
                price = float(input("Enter unit price: "))
            except ValueError:
                print("Invalid quantity or price. Please try again.\n")
                continue

            item = {
                "name": item_name,
                "quantity": quantity,
                "price": price
            }
            selected_order["items"].append(item)
            print("Item added!\n")

        elif edit_choice == "2":
            subtotal = sum(item["quantity"] * item["price"] for item in selected_order["items"])
            sales_tax = subtotal * 0.06
            shipping = 5 if subtotal < 50 and subtotal > 0 else 0 
            total = subtotal + sales_tax + shipping

            selected_order["subtotal"] = subtotal
            selected_order["sales_tax"] = sales_tax
            selected_order["shipping"] = shipping
            selected_order["total"] = total

            print("Finished editing. Order totals updated.\n")
            break

        else:
            print("Invalid choice. Please select 1 or 2.\n")

def show_orders():
    if not orders:
        print("No orders available.\n")
        return

    for idx, order in enumerate(orders, 1):
        print(f"\nOrder {idx}:")
        print(f"Customer: {order['name']}")
        print(f"Address: {order['address']}")
        print("Items Ordered:")
        if order["items"]:
            for item in order["items"]:
                print(f" - {item['name']}: {item['quantity']} @ ${item['price']:.2f}")
        else:
            print(" No items added.")
        
        subtotal = order.get("subtotal", 0)
        sales_tax = order.get("sales_tax", 0)
        shipping = order.get("shipping", 0)
        total = order.get("total", 0)
        print(f"Subtotal: ${subtotal:.2f}")
        print(f"Sales Tax (6%): ${sales_tax:.2f}")
        print(f"Shipping: ${shipping:.2f}")
        print(f"Total: ${total:.2f}")
        print("-" * 30)

def main():
    while True:
        print("Main Menu:")
        print("1. Start A New Order")
        print("2. Edit Existing Order")
        print("3. Show All Orders")
        choice = input("Enter your choice (1-3): ")

        if choice == "1":
            new_order()
        elif choice == "2":
            edit_order()
        elif choice == "3":
            show_orders()
        else:
            print("Invalid selection, please try again.\n")

if __name__ == "__main__":
    main()