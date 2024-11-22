function checkThreadValid(req, res, next) {

    let thread = req.body;

    if(thread && thread.title && thread.description){
        next();
    }
}

function checkPostValid(req, res, next){
    let post = req.body;

    if(post && post.content){
        next();
    }
}

module.exports = {
    checkThreadValid,
    checkPostValid
}