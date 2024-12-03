const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const path = require('path');
const util = require('./util');
const sql = require('sqlite3').verbose();
const config = require('./config.json');
const dbController = require('./dbWrapper');

const auth = require('./middleware/auth');
const formValidation = require('./middleware/formValidation');

const app = express();
const PORT = 3000;
const THIS_URL = 'http://172.16.3.187:' + PORT;
//const FB_URL = 'http://172.16.3.100:420';
const FB_URL = 'https://formbar.yorktechapps.com';
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
    res.locals.config = config;
    next();
});

app.listen(PORT);

app.get('/login', async (req, res) => {

    if (req.query.token) {

        let tokenData = jwt.decode(req.query.token);

        let user = await dbController.get(db, "SELECT * FROM users WHERE fb_id = ?", [tokenData.id]);

        // if the user is not in the database, add them
        if (!user) {

            let rowID = await dbController.run(db, "INSERT INTO users (fb_id, fb_name) VALUES(?,?)", [tokenData.id, tokenData.username]);
            let row = await dbController.get(db, "SELECT * FROM users WHERE uid = ?", [rowID]);

            req.session.user = {
                uid: row.uid,
                fb_id: tokenData.id,
                fb_name: tokenData.username
            };

        } else {
            req.session.user = user;
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

app.post('/thread/:id/create-post', auth.isLoggedIn, formValidation.checkPostValid, async (req, res) => {
    let threadID = req.params.id;
    let post = req.body;

    await dbController.run(db, "INSERT INTO posts (content, thread_uid, poster_uid, time) VALUES(?,?,?,?)", [post.content, threadID, req.session.user.uid, new Date().toISOString()]);
    res.redirect(req.get('referer'));
});

app.get('/profile/:id', async (req, res) => {
    const id = req.params.id;
    let user = await dbController.get(db, "SELECT * FROM users WHERE uid = ?", [id]);

    if (!user) {
        res.render('pages/404');
        return;
    }

    let threads = await dbController.all(db, "SELECT * FROM threads WHERE creator_uid = ? ORDER BY uid DESC LIMIT ?", [id, config.threadsPerPage]);
    let posts = await dbController.all(db, "SELECT * FROM posts INNER JOIN threads ON thread_uid = threads.uid WHERE poster_uid = ? ORDER BY uid DESC LIMIT ?", [id, config.postsPerPage]);

    user.threads = threads;
    user.posts = posts;

    res.render('pages/profile', {userProfile: user});
});

app.get('/create-thread', auth.isLoggedIn, (req, res) => {
    res.render('pages/create-thread');
});

app.post('/create-thread', auth.isLoggedIn, formValidation.checkThreadValid, formValidation.checkPostValid, async (req, res) => {
    let thread = req.body;

    let rowID = await dbController.run(db, "INSERT INTO threads (title, description, creator_uid) VALUES(?,?,?)", [thread.title, thread.description, req.session.user.uid]);
    let threadRow = await dbController.get(db, "SELECT * FROM threads WHERE uid = ?", [rowID]);

    await dbController.run(db, "INSERT INTO posts (content, thread_uid, poster_uid, time) VALUES(?,?,?,?)", [thread.content, threadRow.uid, req.session.user.uid, new Date().toISOString()]);

    res.redirect(`/thread/${threadRow.uid}/1`);
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.all('*', (req, res) => {
    res.render('pages/404');
});