const vowels = {
    a: 'a',
    e: 'e',
    i: 'i',
    o: 'o',
    u: 'u'
};

function isLoggedIn(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

module.exports = {
    isLoggedIn
}