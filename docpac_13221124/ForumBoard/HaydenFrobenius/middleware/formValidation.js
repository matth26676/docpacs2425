function checkThreadValid(req, res, next) {

    let thread = req.body;

    if(thread && thread.title && thread.content){
        next();
    } else {
        req.send('wrong');
    }
}

function checkPostValid(req, res, next){
    let post = req.body;

    if(post && post.content){
        next();
    } else {
        req.send('wrong');
    }
}

module.exports = {
    checkThreadValid,
    checkPostValid
}