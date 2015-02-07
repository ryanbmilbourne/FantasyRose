/*
 * GET Contestant list page
 */
module.exports = function(app){
    app.get('/girls', function(req, res){
        res.render('girls', {user: req.user});
    });
};
