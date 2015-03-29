/*
 * Event Reporting routes
 */
module.exports = function(app, util, funct){
    app.use('/events', function(req, res, next){
        if(req.isAuthenticated()){
            if(req.user.admin){ return next();}
            req.session.error = 'You must be signed in as an Adminstrator to view the requested page.';
            res.redirect('/');
        }
        req.session.error = 'You must be signed in to view the requested page.';
        res.redirect('/signin');
    });

    /*
     * GET event reporting page.
     */
    app.get('/events', function(req, res, next){
        res.render('events', {week: funct.weekNum, user: req.user});
    });
};
