/*
 * GET Contestant list page
 */
module.exports = function(app, funct){
    app.get('/girls', function(req, res){
        funct.getContestants().then(function(results){
            res.render('girls', {user: req.user, girls: results});
        }).fail(function(err){
            res.render('girls', {user: req.user, girls: []});
            req.session.failure= 'Error fetching contestant database'+err.body;
        });
    });
};
