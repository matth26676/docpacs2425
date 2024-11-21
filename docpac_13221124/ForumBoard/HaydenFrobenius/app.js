const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const path = require('path');
const util = require('./util');
const sql = require('sqlite3').verbose();
const config = require('./config.json');
const dbController = require('./dbWrapper');

const app = express();
const PORT = 3000;
const THIS_URL = 'http://localhost:' + PORT;
const FB_URL = 'http://172.16.3.100:420';
const AUTH_URL = FB_URL + '/oauth';
const SECRET = "guh";

let db = new sql.Database('db/database.db');

app.set('view engine', 'ejs');
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false
}));

//automatically pass user info to views
app.use((req, res, next) => {
    res.locals.loggedIn = (typeof req.session.user !== 'undefined');
    res.locals.user = req.session.user;
    next();
});

function isLoggedIn(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

app.listen(PORT);

app.get('/login', async (req, res) => {

    if (req.query.token) {

        let tokenData = jwt.decode(req.query.token);
        req.session.user = tokenData;

        let user = await dbController.get(db, "SELECT * FROM users WHERE fb_id = ?", [tokenData.id]);

        // if the user is not in the database, add them
        if (!user) {
            await dbController.run(db, "INSERT INTO users (fb_id, fb_name) VALUES(?,?)", [tokenData.id, tokenData.username]);
        }

        res.redirect('/');

   } else {
        const redirectUrl = util.addParamsToURL(`${AUTH_URL}`, {redirectURL: `${THIS_URL}/login`});
        res.redirect(redirectUrl);
   };
});

app.get('/', async (req, res) => {
    let threads = await dbController.all(db, "SELECT * FROM threads");

    res.render('pages/index', {threads: threads});
});

app.get('/thread/:id/:page', async (req, res) => {
    const id = req.params.id;
    const page = req.params.page - 1;

    if(page < 0) {
        res.render('pages/404');
        return;
    }

    const postsPerPage = config.postsPerPage;
    const thread = await dbController.get(db, "SELECT * FROM threads WHERE uid = ?", [id]);

    if (!thread) {
        res.render('pages/404');
        return;
    }

    let totalPages = await dbController.get(db, "SELECT COUNT(*) as count FROM posts WHERE thread_uid = ?;", [id]);
    totalPages = Math.ceil(totalPages.count / postsPerPage);
    if(totalPages === 0) totalPages = 1;

    const posts = await dbController.all(db, "SELECT * FROM posts INNER JOIN users ON poster_uid = users.uid WHERE thread_uid = ? LIMIT ? OFFSET ?;", [id, postsPerPage, page * postsPerPage]);

    res.render('pages/thread', {thread: thread, posts: posts, page: page + 1, totalPages: totalPages});
});

app.get('/profile/:id', async (req, res) => {
    const id = req.params.id;
    let user = await dbController.get(db, "SELECT * FROM users WHERE uid = ?", [id]);

    if (!user) {
        res.render('pages/404');
        return;
    }

    res.render('pages/profile', {userProfile: user});
});

app.all('*', (req, res) => {
    res.render('pages/404');
});