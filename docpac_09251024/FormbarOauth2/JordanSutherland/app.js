const sqlite3 = require('sqlite3');
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { profile } = require('console');

const app = express();
const PORT = 3000;
const FBJS_URL = 'http://172.16.3.212:420'
const THIS_URL = 'http://localhost:3000/login'
const API_KEY = '6116102382185455b569e0a2e21603115a5ff12b9cec5f5967d249e4e56fb8f85f0890997f3ab7429c34a67e1a0b2f69e5362fe95a7054953f71bef746faad14'

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
	secret: 'mvVANFOadnbh2447rgw5mxh6Suc23vnksbcznmkce0wmaeupeq41vncm',
	resave: false,
	saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
	if (req.session.user) next()
	else res.redirect(`/login?redirectURL=${THIS_URL}`)
};

const db = new sqlite3.Database('database.db', (err) => {
	if (err) {
		return console.error(err.message);
	}
	console.log('Connected to the in-memory SQlite database.');
});

app.get('/', isAuthenticated, (req, res) => {
	res.render('index');
})

app.get('/login', (req, res) => {
	if (req.query.token) {
		let tokenData = jwt.decode(req.query.token)
		req.session.token = tokenData
		req.session.user = tokenData.username
		res.redirect('/')
	} else {
		res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`)
	}
})

app.get('/profile', isAuthenticated, (req, res) => {
	try {
		fetch(`${FBJS_URL}/api/me`, {
			method: 'GET',
			headers: {
				'API': API_KEY,
				'Content-Type': 'application/json'
			}
		})
			.then(response => {
				return response.json();
			})
			.then(data => {
				db.get(`SELECT * FROM users WHERE fb_id = ?`, [req.session.token.id], (err, row) => {
					if (err) {
						return console.error(err.message);
					} else {
						if (row) {
							let profile_checked = row.profile_checked
							res.render('profile', { data: data, profile_checked: profile_checked });
						} else {
							res.render('profile', { data: data, profile_checked: 0 });
						}
					}
				});
			})
	}
	catch (error) {
		res.send(error.message)
	}
});

app.post('/profile', (req, res) => {
	let checkbox = req.body.checkbox ? 1 : 0;
	let id = req.session.token.id
	let username = req.session.user
	try {
		db.get(`SELECT * FROM users WHERE fb_id = ?`, [id], (err, row) => {
			if (err) {
				return console.error(err.message);
			} else {
				if (row) {
					db.run(`UPDATE users SET profile_checked = ?`, [checkbox], (err) => {
						if (err) {
							return console.error(err.message);
						} else {
							res.redirect('/profile')
						}
					});
				} else {
					db.run(`INSERT INTO users (fb_id, fb_name, profile_checked) VALUES (?, ?, ?)`, [id, username, checkbox], (err) => {
						if (err) {
							return console.error(err.message);
						} else {
							res.redirect('/profile');
						}
					});
				}
			}
		})


	} catch (error) {
		res.send(error.message)
	}
})

app.listen(PORT, () => {
	console.log('Server is running on http://localhost:3000');
});