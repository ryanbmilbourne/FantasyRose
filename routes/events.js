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

    /*
     * POST adding an event
     */
    app.post('/events', function(req, res, next){
        console.log('rx event: '+util.inspect(req.body));
        if(!req.isAuthenticated() && !req.user.admin){
            req.session.error = 'You must be an admin to make a post to this route.';
            res.redirect('/signin');
            return next();
        }
        funct.postEvent({
                week: funct.weekNum, 
                name: req.body.name,
                trigger: req.body.trigger,
                modCount: req.body.modCount
          }).then(function(result){
            req.session.success = 'Event logged!';
            res.redirect('events');
            res.sendStatus(201);
        }).fail(function(err){
            req.session.failure = 'Error putting to database: '+err.body;
            res.redirect('events');
            res.sendStatus(500);
        });

    });
};
