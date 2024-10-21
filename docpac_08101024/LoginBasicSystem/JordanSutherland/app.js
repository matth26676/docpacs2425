const express = require('express')
const path = require('path');
const app = express();
const sqlite = require('sqlite3')
const crypto = require('crypto')

const key = crypto.randomBytes(32).toString('hex')
const algorithm = 'aes-256-cbc';

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText) {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encrypted = textParts.join(':');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

console.log(encrypt("Gaga"), decrypt(encrypt("Gaga")))

const db = new sqlite.Database(path.join(__dirname, 'credentials.db'))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define a simple route
app.get('/', (req, res) => {
    res.render('index', {username: "", email: ""})
});

app.get('/login', (req, res) => {
    res.render('login', {})
});

app.post('/login', (req, res) => {
    console.log(req.body.username)
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            return res.status(500).send('Internal server error')
        }
        if (!row) {
            return res.status(400).send('User not found')
        }
        const decryptedPassword = decrypt(row.password)
        if (decryptedPassword === password) {
            res.redirect('/?username=' + username + '&email' + row.email)
        } else {
            return res.status(400).send('Incorrect password')
        }
    })
})

app.get('/signup', (req, res) => {
    res.render('signup', {})
});

app.post('/signup', (req, res) => {
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    const encryptedPassword = encrypt(password)
    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, encryptedPassword], (err) => {
        if (err) {
            return res.status(500).send('Internal server error')
        }
        res.render('login', {})
    })
})

app.use(express.static(path.join(__dirname, 'public')));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});