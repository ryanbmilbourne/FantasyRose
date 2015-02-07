/*
 * GET Rules page
 */
module.exports = function(app){
    app.get('/rules', function(req, res){
        res.render('rules', {user: req.user});
    });
};
