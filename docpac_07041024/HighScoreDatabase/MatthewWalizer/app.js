// lets js know that it needs to use express and then grabs the express module
const sqlite3 = require('sqlite3')
const express = require('express');
const { error, log } = require('console');
const fs = require('fs')
const requestIp = require('request-ip')


const app = express();
const port = 3000;

// uses the ejs templating engine to view files
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.text())

// sets the port used to port 3000
app.set('port', process.env.PORT || 3000);


// logs each request
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

// starts the server
app.listen(port, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`Server listening on port ${port}`);
    }
});

let db = new sqlite3.Database('data/Database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the data/Database database')
});

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/game', (req, res) => {
    res.render('game')
})

app.get('/hiscore', (req, res) => {
    db.all(`SELECT * FROM Users ORDER BY Score DESC LIMIT 10`, (err, row) => {
        if (err) {
            console.error(err.message);
        } else {
            if (!row) {
                console.error(err)
            } else {
                res.render('hiscore', { data: row });
            }
        }
    })
});

app.post('/hiscore', (req, res) => {
    var value = JSON.parse(req.body)
    console.log(value)
    try {
        if (!value.Name) { 
            throw new Error(`Value of ${value.Name} is null or undefined`)
        } else if (!value.Score) { 
            if (value.Score != 0) {
                throw new Error(`Value of ${value.Score} is null or undefined`)
            }
        }
        var clientIp = requestIp.getClientIp(req)
        console.log("test")
        console.log(clientIp)
        db.run(`INSERT INTO Users(Ip, Username, Score) VALUES(?, ?, ?)`, [clientIp, value.Name, value.Score])
    } catch (err) {
        res.render('error', {err: err})
    }
});