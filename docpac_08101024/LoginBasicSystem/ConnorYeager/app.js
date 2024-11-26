const express = require("express")
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto")
const PORT = 3000;

const app = express();

app.set('view engine', 'ejs');

var mykey = crypto.createCipher('aes-128-cbc', 'mypassword');
var mystr = mykey.update('abc', 'utf8', 'hex')
mystr += mykey.final('hex');

console.log(mystr); //34feb914c099df25794bf9ccb85bea72

let db = new sqlite3.Database('data/LoginBasicDB.db', (err) => {
    if (err) {
        console.error(err);
    }
    else {
        console.log("Opened database successfully!");
    }
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.POST('/login', (req, res)=> {
 try {
    let username = req.body.username;
    let password = req.body.password;
 } catch (error){
    res.render("error", {error: error.message});
 }
});

app.get('/signup', (req, res) => {
    res.render('singup')
});

// app.POST('/signup')

app.listen(PORT);