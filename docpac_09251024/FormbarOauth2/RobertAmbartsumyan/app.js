//SIR LWEIS HAMILTON
//I AM THE DANGER
//I AM THE ONE WHO KNOCKS
const jwt = require('jsonwebtoken')
const express = require('express')
const session = require('express-session')
const sqlite3 = require('sqlite3')

const app = express()
const PORT = 3000

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const FBJS_URL = 'http://172.16.3.100:420'
const THIS_URL = 'http://localhost:3000/login'

//This is the secret key for the session
app.use(session({
    secret: 'ThisIsTopMilitarySecret',
    resave: false,
    saveUninitialized: false
}))

//This is ogga bogga middle ware to check for users auth
function isAuthenticated(req, res, next) {
    console.log("Checking Auth");
    if (req.session.user) next();
    else res.redirect(`/login?redirectURL=${THIS_URL}`);
}

//Burh
const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.error('Database opening error: ', err);
    } else {
        console.log('Database opened');
    }
});

app.get('/', isAuthenticated, (req, res) => {
    res.render('index.ejs');
});

app.get('/login', (req, res) => {
    console.log('Token print');
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token)
        req.session.token = tokenData
        req.session.user = tokenData.username
        res.redirect('/')
    } else {
        console.log('Token not defined');
        res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`)
    }
})

app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile.ejs', { username: req.session.user });
});

app.post('/profile', isAuthenticated, (req, res) => {

    let checkbox = req.body.checkbox ? 1 : 0;
    console.log(`Checkbox value: ${checkbox}`);
    let username = req.session.user;
    let id = req.session.token.id;

    // Glorp zorp, blip blop!
    // I WILL NOT BE IGNORED
    // I WILL ZORP BEEP SOMP
    // SWO BEEP BEEP
    // - Co-Poilet

    try {
        db.get('SELECT * FROM users WHERE fb_id = ?', [id], (err, row) => {
            if (err) {
                console.error(err.message);
            } else {
                if (row) {
                    console.log('update');
                    db.run('UPDATE users SET profile_checked = ? WHERE fb_id = ?', [checkbox, id], (err) => {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log('User updated');
                            res.redirect('/profile');
                        }
                    });
                } else {
                    console.log('insert');
                    db.run('INSERT INTO users (fb_id, fb_name, profile_checked) VALUES (?, ?, ?)', [id, username, checkbox], (err) => {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log('User inserted');
                            res.redirect('/profile');
                        }
                    });
                }
            }
        });
    } catch (err) {
        console.error('Database error: ', err);
    }
});

//Done at the vally of the shadow people
//I AM NOT IN DANGER, I AM THE DANGER
//I AM THE ONE WHO KNOCKS
//I AM THE DANGER
//I AM THE ONE WHO KNOCKS
// - Co-Poilet

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});