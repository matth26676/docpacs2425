const sqlite3 = require('sqlite3').verbose();
 
let db = new sqlite3.Database('thedatabase.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Successfully opened database");
    }
})
 
db.all( 'SELECT * FROM cats INNER JOIN users ON users.uid = cats.owner WHERE color=?;', 'brown', (err, row) => {
    if (err) {
        console.log(err);
    } else {
        console.log(row);  
    }
});