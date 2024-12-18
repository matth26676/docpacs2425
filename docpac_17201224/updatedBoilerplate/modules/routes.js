const express = require('express');
const app = express();
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const socketIo = require('socket.io');
PORT = 3000;
const sqlite3 = require('sqlite3');
path = require('path');
const crypto = require('crypto');

const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('db connected');
    }
});

function index(req, res) {
    res.render('index.ejs');
}

function login(req, res) {
    res.render('login.ejs');
}

function loginPost(req, res) {
   
    console.log(req.body)
    if (req.body.user && req.body.pass) {
        db.get('SELECT * FROM users WHERE username=?;', req.body.user, (err, row) => {
            if (err) {
                console.error(err);
                res.send("Ther was an error: \n" + err);
            } else if (!row) {
                console.log('this is working bruh')
                const salt = crypto.randomBytes(16).toString('hex')

                //use the salt to 'hash' the password 
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send('error hashing password') + err
                    } else {
                        const hashedPassword = derivedKey.toString('hex')
                        db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?);', [req.body.user, hashedPassword, salt], (err) => {
                            if (err) {
                                res.send('Database error: \n' + err)
                            } else {
                                res.send('created new user')
                            }
                        })
                    }
                })

            } else if (row) {

                // Compare stored password with provided password 
                crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send('Error hasing password')
                    } else {
                        hashedPassword = derivedKey.toString('hex')

                        if (row.password === hashedPassword) {
                            req.session.user = req.body.user
                            res.redirect('/chat')
                        } else {
                            res.send('incorrect password')
                        }
                    }
                })

            }
        })
    } else {
        res.send("You need a username and password");
    }



}

function logout(req, res) {
    res.send('Hello World!');
}

function chat(req, res) {
    res.send('Hello World!');
}



module.exports = {
    index,
    login,
    loginPost,
    logout,
    chat
}