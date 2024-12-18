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

function loginPost(req, res) {

    const data = req.body;

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
    loginPost,
    logout,
    chat
}