/*
 * Admin routes
 */

module.exports = function(app, util, funct){
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

    //add a contestant.  Called from the admin page.
    app.post('/contestants', function(req, res, next){
        console.log('rx contestant add: '+util.inspect(req.body));
        if(!req.isAuthenticated()){
            req.session.error = 'You must be signed in to view the requested page.';
            res.redirect('/signin');
            return next();
        }
        if(!req.user.admin){
            req.session.error = 'You must be signed in as an Adminstrator to view the requested page.';
            res.redirect('/');
            return next();
        }
        funct.putContestant(req.body.name, req.body).then(function(result){
            req.session.success='Contestant '+req.body.name+' added.';
            res.redirect('admin');
            res.sendStatus(201);
        }).fail(function(err){
            req.session.failure='Error putting to database: '+err.body;
            res.redirect('admin');
            res.sendStatus(500);
        });
    });

    //add an event type.  Called from the admin page.
    app.post('/triggers', function(req, res, next){
        console.log('rx trigger add: '+util.inspect(req.body));
        if(!req.isAuthenticated()){
            req.session.error = 'You must be signed in to view the requested page.';
            res.redirect('/signin');
            return next();
        }
        if(!req.user.admin){
            req.session.error = 'You must be signed in as an Adminstrator to view the requested page.';
            res.redirect('/');
            return next();
        }
        funct.putTrigger(req.body.name, req.body).then(function(result){
            req.session.success='Trigger '+req.body.name+' added.';
            res.redirect('admin');
            res.sendStatus(201);
        }).fail(function(err){
            req.session.failure='Error putting to database: '+err.body;
            res.redirect('admin');
            res.sendStatus(500);
        });
    });
};
