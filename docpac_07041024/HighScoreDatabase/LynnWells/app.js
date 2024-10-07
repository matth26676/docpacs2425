//import sqlite3 module
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const fs = require("fs");

const app = express();

app.use(express.json());
app.set('view engine', 'ejs');

//create database object
let db = new sqlite3.Database('myDB.db', (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('Opened database successfully!')
    }
});

app.get('/', (req, res) => {
    db.all(`SELECT * FROM cats INNER JOIN users ON users.uid = cats.owner`, (err, rows) => {
        if (err) {
            console.error(err)
        } else {
            res.render('index', {data: rows});
        }
    });
});

app.post('/sendScore', (req, res) => {
    // const data = JSON.parse(fs.readFileSync('./myDB.db')).data;
    const body = req.body;
    const orderData = {
        user_name: body.user_name,
        score: body.score,
        ip: body.ip
    }
    
    

    console.log(orderData);
});

app.listen(3000)