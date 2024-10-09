const express = require('express');
const app = express();
const PORT = 3000;

const sql3 = require('sqlite3').verbose();
const crypto = require('crypto');

app.use(express.json());

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let passLength = 1;
let maxLen = 20;

// Use a consistent key and iv for encryption/decryption
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text) {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

let db = new sql3.Database('database.db', (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Opened database');
    }
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/home', (req, res) => {
    res.render('home', { user: req.query.user, email: req.query.email });
});

app.post('/login', (req, res) => {
    try {
        let email = req.body.email;
        let username = req.body.username;
        let password = req.body.password;

        if (username.length <= 0) {
            throw new Error(`Name does not exist. ummm be better`);
        }

        if (username.length > maxLen) {
            throw new Error(`Name is too long. keep it under ${maxLen} silly.`);
        }

        if (password.length <= passLength) {
            throw new Error(`Password is too small. Do better.`);
        }

        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                res.render('error', { error: err.message });
                return;
            }
            if (row) {
                let decryptedPassword = decrypt(row.password);
                if (decryptedPassword === req.body.password) {
                    res.redirect(`/home?user=${users.username}&email=${users.email}}`);
                } else {
                    res.render('error', { error: 'Invalid password' });
                }
            } else {
                res.render('error', { error: 'User not found' });
            }
        });

    } catch (error) {
        res.render('error', { error: error.message });
    }
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let email = req.body.email;

        if (username.length <= 0) {
            throw new Error(`Name does not exist. ummm be better`);
        }

        if (username.length > maxLen) {
            throw new Error(`Name is too long. keep it under ${maxLen} silly.`);
        }

        if (password.length <= passLength) {
            throw new Error(`Password is too small. Do better.`);
        }

        if (!email.includes('@')) {
            throw new Error('Email invalid.');
        }

        let userExists = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) {
                    reject(new Error(err.message));
                } else {
                    resolve(!!row);
                }
            });
        });

        if (userExists) {
            throw new Error('User already exists');
        } else {
            let encryptedPassword = encrypt(password);
            db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, encryptedPassword, email], (err) => {
                if (err) {
                    throw new Error(err.message);
                }
                res.redirect('/login');
            });
        }

    } catch (error) {
        res.render('error', { error: error.message });
    }
});

app.get('/error', (req, res) => {
    res.render('error');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
