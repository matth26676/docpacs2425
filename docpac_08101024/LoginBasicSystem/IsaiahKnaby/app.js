const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const crypto = require('crypto');
const PORT = 3000;

var mykey = crypto.createCipher('aes-128-cbc', 'mypassword');
var mystr = mykey.update('abc', 'utf8', 'hex')
mystr += mykey.final('hex');

let db = new sqlite3.Database('data/users.db', (err) =>{
    if (err) {
        console.error(err)
    } else {
        console.log("connected to db")
    }
})

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/signup', (req,res) => {
    res.render('signup')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.listen(PORT, () => {
    console.log('Server is running on port 3000');
});
