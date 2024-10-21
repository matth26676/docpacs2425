const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const crypto = require('crypto')
const key = "efefef"
const db = new sqlite3.Database('./07database.db')
const path = require('path')
const app = express()
const port = 3002


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body
    const encryptedPassword = crypto.createHmac('sha256', key).update(password).digest('hex')

    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, encryptedPassword], (err, row) => {
        if (err || !row) {
            res.redirect('/error')
        } else {
            res.redirect(`/home?user=${row.username}&email=${row.email}`)
        }
    });
});

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    const encryptedPassword = crypto.createHmac('sha256', secretKey).update(password).digest('hex')

    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, encryptedPassword], function (err) {
        if (err) {
            console.error(err.message)
            res.redirect('/error')
        } else {
            res.redirect('/login')
        }
    })
})


app.get('/error', (req, res) => {
    const errorCode = req.query.errorCode || 500
    res.render('error', { errorCode: errorCode })
})

app.get('/home', (req, res) => {
    const { user, email } = req.query;
    res.render('home', { user, email })
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})

app.listen(port, (err) => {
    if (err) {
        console.error('Failed to start server:', err);
    } else {
        console.log(`Server is running on http://localhost:${port}`);
    }
});