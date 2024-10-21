const express = require('express');
const app = express()
const sqlite3 = require('sqlite3')
const crypto = require('crypto')

let iv = crypto.randomBytes(16);
const key = "jjeo39jd7chdlp3cldi3kdvm93jdnso3";


app.use(express.urlencoded({extended: true}))

const db = new sqlite3.Database('data.db', (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('database running')
    }
})

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.get('/home', (req, res) => {
    var user = req.query.user
    var email = req.query.email
    res.render('home', {
        user: user,
        email: email
    })
})

app.post('/login', (req, res) => {
    try {
        if(!req.body.username && !req.body.password) {
            throw new Error('No Username or Password')
        } else if (!req.body.username) {
            throw new Error('No Username')
        } else if (!req.body.password) {
            throw new Error('No Password')
        } else {
            let cipher = crypto.createCipher('aes256', key)
            cipher.update(req.body.password, 'utf-8', 'hex')
            
            var passEn = cipher.final('hex')
            console.log(passEn)
            db.get('SELECT * FROM users WHERE username=? AND password=?;', [req.body.username, passEn], (err, row) => {
                try {
                    if (err) {
                        throw new Error(err)
                    }
                    if (row) {
                        res.redirect(`/home?user=${row.username}&email=${row.email}`)
                    } else {
                        throw new Error("Invalid Username or Password")
                    }
                } catch (err) {
                    res.render('error', {err: err, section: "/login"})
                }
            })
        }
    } catch(err) {
        res.render('error', {err:err, section:"/login"})
    }
})

app.post('/signup', (req, res) => {
    try {
        if(!req.body.username || !req.body.password || !req.body.email) {
            throw new Error("Empty Fields")
        } else {
            let cipher = crypto.createCipher('aes256', key)
            
            cipher.update(req.body.password, 'utf-8', 'hex')

            let enPassword = cipher.final('hex')

            db.run('INSERT INTO users(username, email, password) VALUES(?, ?, ?)', [req.body.username, req.body.email, enPassword], (err) => {
                try {
                    if (err) {
                        throw new Error("Existing Record")
                    } else {
                        res.redirect('/login')
                    }
                } catch (error) {
                    res.render('error', {err:error, section:"/signup"})
                }
            })
        }
    } catch (err) {
        res.render('error', {err:err, section:"/signup"})
    }
})

app.listen(3000, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('Server running on port 3000');
    }
})