const jwt = require('jsonwebtoken')
const express = require('express')
const app = express()
const sqlite3 = require('sqlite3')
const session = require('express-session')

app.use(session({
	secret: 'YepThatsMe',
	resave: false,
	saveUninitialized: false
  }))

  app.use(express.urlencoded({ extended: true }))

const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to the data/Database.db!')
    }
});

const FBJS_URL = 'http://172.16.3.212:420'
const THIS_URL = 'http://localhost:3000/login'

function isAuthenticated(req, res, next) {
	if (req.session.user) next()
	else res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`)
}

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('index')
})

app.get('/profile', isAuthenticated, (req, res) => {
	db.get(`SELECT * FROM users WHERE fb_name=?`, req.session.user, (err, row) => {
		if (err) {
			res.send(err)
		}
		res.render('profile', {name: req.session.user, id: req.session.userid, boxCheck: row.profile_checked})
	})
})

app.get('/login', (req, res) => {
	if (req.query.token) {
		let tokenData = jwt.decode(req.query.token)
		req.session.token = tokenData
		req.session.user = tokenData.username
		req.session.userid = tokenData.id
		db.get(`SELECT * FROM users WHERE fb_name=?;`, req.session.user, (err, row) => {
			if (err) {
				res.send(err)
			}
			if (!row) {
				db.run(`INSERT INTO users(fb_name, fb_id, profile_checked) VALUES(?, ?, ?)`, [req.session.user, req.session.userid, null], (err))
			}
		})
		res.redirect('/profile')
	} else {
		res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`)
	}
})

app.post('/profile', (req, res) => {
	db.run(`UPDATE users SET profile_checked=? WHERE fb_id=?`, [req.body.checkBox, req.session.userid], (err) => {
		if (err) {
			res.send(err)
		} else {
			db.get(`SELECT * FROM users WHERE fb_name=?`, req.session.user, (err, row) => {
				if (err) {
					res.send(err)
				}
				res.render('profile', {name: req.session.user, id: req.session.userid, boxCheck: row.profile_checked})
			})
		}
	})
})

app.listen(3000)