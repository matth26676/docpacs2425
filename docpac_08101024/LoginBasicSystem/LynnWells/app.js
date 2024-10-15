const sqlite3 = require("sqlite3")
const crypto = require("crypto")
const app = require("express")()
const PORT = 3000;

app.set('view engine', 'ejs');

let db = new sqlite3.Database('myDB.db', (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('Opened database successfully!')
    }
});

app.get('/', (req, res) => {
    res.render('index');

});

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', (req, res) => { 
    try {
        if (!req.body.username || !req.body.password) {
            console.error("Username or Password is invalid");
        } else {
            db.get('SELECT * FROM users', (err, rows) => {
                if (err) {
                    res.render('error', {error: err.message});
                } else {
                    if (req.body.username == rows.username && req.body.password == rows.password) {
                        console.log('Gordon! My password meter is getting dangerously high!')
                        res.render(`home?username=${rows.username}&email=${rows.email}`);
                    };
                };
            });
        };
    } catch (err) {
        res.render('error', {error: err.message});
    };
});

app.post('/signup', (req, res) => { 
    try {
        if (req.body.username === undefined || req.body.password === undefined || req.body.email === undefined) {
            console.error("All forms must be filled out");
        } else {
            db.run(`INSERT INTO users (username, email, password) VALUES ('?', '?', '?')` [req.body.username, req.body.email, req.body.password],   (err, rows) => {
                if (err) {
                    res.render('error', {error: err.message});
                } else {
                    if (req.body.username == rows.username && req.body.password == rows.password) {
                        console.log('Gordon! My password meter is getting dangerously high!')
                        res.render(`home?username=${rows.username}&email=${rows.email}`);
                    };
                };
            });
        };
    } catch (err) {
        res.render('error', {error: err.message});
    };
});

app.get('/error', (req, res) => {
    res.render('error');
});

app.get('/home', (req, res) => {
    const username = req.query.name;
    const email = req.query.name;
    res.render('home');
});

app.listen(PORT);