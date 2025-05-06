var rls = require('readline-sync');
var orders = [];

let UserChoice = rls.question("what would you like to do \n 1.add order 2.edit order 3.view orders \n")

// running = true

// while (running) {
    




// }


if (UserChoice == "1"){
  UsersName  = rls.question("what is the name for the order\n")
  UsersAddress  = rls.question("what is the Address for the order\n")
let ordering = true
while( ordering == true){
    Item  = rls.question("what is the name for the item \n")
    itemPrice  = rls.question("what is the price\n")
    itemAmount  = rls.question("what is the Amount\n")
    continueOrder = rls.question("would you like to contion with ording another item \n  1.yes 2.no")
    if (continueOrder == "1"){}
    else if (continueOrder =="2"){ordering = false}
    else {console.log("invalied input redo order")}
}
}