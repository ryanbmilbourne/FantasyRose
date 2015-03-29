/*
 * Admin routes
 */

module.exports = function(app){
    //basic middleware for admin related pages to check for authentication first.
    app.use('/admin', function(req, res, next){
        if(req.isAuthenticated()){
            if(req.user.admin){ return next();}
            req.session.error = 'You must be signed in as an Adminstrator to view the requested page.';
            res.redirect('/');
        }
        req.session.error = 'You must be signed in to view the requested page.';
        res.redirect('/signin');
    });

    //admin page
    app.get('/admin', function(req, res){
        res.render('admin', {user: req.user});
    });
};
