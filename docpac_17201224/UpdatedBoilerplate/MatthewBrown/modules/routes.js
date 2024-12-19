const bcrypt = require('bcrypt');

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

const root = (req, res) => {
    if (req.session && req.session.user) {
        res.render('index', { username: req.session.user.username });
    } else {
        res.render('index', { username: null });
    }
};

const loginGet = (req, res) => {
    res.render('login');
};

const loginPost = (req, res, db) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error('Error querying database:', err.message);
            res.redirect('/login');
        } else if (row) {
            // User exists, verify password
            bcrypt.compare(password, row.password, (err, result) => {
                if (err) {
                    console.error('Error comparing password:', err.message);
                    res.redirect('/login');
                } else if (result) {
                    req.session.user = { username: row.username };
                    res.redirect('/');
                } else {
                    res.redirect('/login');
                }
            });
        } else {
            // User does not exist, create new user
            const saltRounds = 10;
            bcrypt.genSalt(saltRounds, (err, salt) => {
                if (err) {
                    console.error('Error generating salt:', err.message);
                    res.redirect('/login');
                } else {
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) {
                            console.error('Error hashing password:', err.message);
                            res.redirect('/login');
                        } else {
                            db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?)', [username, hash, salt], (err) => {
                                if (err) {
                                    console.error('Error inserting new user:', err.message);
                                    res.redirect('/login');
                                } else {
                                    req.session.user = { username: username };
                                    res.redirect('/');
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

const chat = (req, res) => {
    res.render('chat');
};

function testAlert() {
    console.log('Hello Routes.js!');
}

module.exports = {
    root,
    loginGet,
    loginPost,
    logout,
    chat,
    testAlert,
    isAuthenticated
};