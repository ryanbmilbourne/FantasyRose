/*
 * GET Rules page
 */
module.exports = function(app, funct){
    app.get('/rules', function(req, res){
        funct.getTriggers().then(function(results){
            res.render('rules', {user: req.user, triggers: results});
        }).fail(function(err){
            res.render('rules', {user: req.user, triggers: []});
            req.session.failure= 'Error fetching contestant database'+err.body;
        });
    });
};
