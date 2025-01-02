const sql = require('sqlite3');
const jwt = require('jsonwebtoken')
const db = new sql.Database('./database/database.db');
const dbControl = require('./dbControl');
const bcrypt = require('bcrypt');
const util = require('./util')

const THIS_URL = `http://${process.env.HOST}:${process.env.PORT}`;
const AUTH_URL = process.env.FORMBAR_URL + '/oauth';

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

function index(req, res) {
  res.render('index');
}

function login(req, res) {
    res.render('login');
}

function formbarLogin(req, res) {
    if (req.query.token) {

        let tokenData = jwt.decode(req.query.token);

        req.session.user = {
            uid: null,
            username: tokenData.username
        };

        res.redirect('/');

   } else {
        const redirectUrl = util.addParamsToURL(`${AUTH_URL}`, {redirectURL: `${THIS_URL}/fblogin`});
        res.redirect(redirectUrl);
   };
}

async function loginPost(req, res) {

    const formData = req.body;
    const username = formData.username;
    const password = formData.password;

    let error = '';

    if(username.trim() === '') error = 'Username Required';
    if(password.trim() === '') error = 'Password Required';

    if(error){
        return res.render('error', {error});
    }

    const existingUser = await dbControl.get(db, "SELECT * FROM users WHERE username = ?;", [username]).catch((error) => {
        return res.render('error');
    });

    if(existingUser){
        // user exists

        req.session.user = {
            uid: existingUser.uid,
            username: existingUser.username
        }

        return res.redirect('/')

    } else {
        // user does not exist, so add them to the database

        // icky callback
        bcrypt.hash(password, async (hashedPassword) => {
            const lastID = await dbControl.run(db, "INSERT INTO users (username, password) VALUES (?,?);", [username, hashedPassword]).catch((error) => {
                return res.render('error');
            });
            
            req.session.user = {
                uid: lastID,
                username: username
            }

            return res.redirect('/');
        });

    }

}

function logout(req, res) {
    req.session.destroy();
    res.redirect('/');
}

function chat(req, res) {
    res.render('chat');
}

module.exports = {
    isAuthenticated,
    index,
    login,
    formbarLogin,
    loginPost,
    logout,
    chat
}