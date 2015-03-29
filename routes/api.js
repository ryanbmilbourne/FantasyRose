/*
 * API routes
 */

module.exports = function(app, util, funct){
    //for promises
    var Q = require('q');

    app.use('/api', function(req, res, next){
        if(!req.isAuthenticated()){
            req.session.error = 'You must be signed in to view the requested page.';
            res.redirect('/signin');
        }
        return next();
    });

    /*
     * Get contestants array
     */
    app.get('/api/contestants', function(req, res, next){
        funct.getContestants().then(function(contestants){
            res.send(contestants);
        }).fail(function(err){
            console.error('Error fetching database'+err.body);
            req.session.failure = 'error fetching database: '+err.body;
            res.send(500);
            return next();
        });
    });

    /*
     * Add a contestant.  Called from admin page.
     */
    app.post('/api/contestants', function(req, res, next){
        console.log('rx contestant add: '+util.inspect(req.body));
        if(!req.user.admin){
            req.session.error = 'You need to be an admin to access this route!';
            res.redirect('/');
            return next();
        }
        funct.putContestant(req.body.name, req.body).then(function(result){
            console.log(util.inspect(result));
            req.session.success='Contestant '+req.body.name+' added.';
            res.redirect('admin');
            res.sendStatus(201);
        }).fail(function(err){
            req.session.failure='Error putting to database: '+err.body;
            res.redirect('admin');
            res.sendStatus(500);
        });
    });

    /**
     * Get triggers array (Triggers are things users report that are worth points
     */
    app.get('/api/triggers', function(req, res, next){
        funct.getTriggers().then(function(triggers){
            res.send(triggers);
        }).fail(function(err){
            console.error('Error fetching database'+err.body);
            req.session.failure = 'error fetching database: '+err.body;
            res.send(500);
            return next();
        });
    });

    /*
     * Add a trigger.  Called from admin page.
     */
    app.post('/api/triggers', function(req, res, next){
        console.log('rx trigger add: '+util.inspect(req.body));
        if(!req.user.admin){
            req.session.error = 'You must be signed in as an Adminstrator to view the requested page.';
            res.redirect('/');
            return next();
        }
        funct.putTrigger(req.body.name, req.body).then(function(result){
            console.log(util.inspect(result));
            req.session.success='Trigger '+req.body.name+' added.';
            res.redirect('admin');
            res.sendStatus(201);
        }).fail(function(err){
            req.session.failure='Error putting to database: '+err.body;
            res.redirect('admin');
            res.sendStatus(500);
        });
    });

    /*
     * POST adding an event.
     * An event is an occurance of a trigger.
     * Each time an event is logged, a contestant gets points equal to the value of the trigger.
     */
    app.post('/api/events', function(req, res, next){
        console.log('rx event: '+util.inspect(req.body));
        //are we auth'd?
        if(!req.isAuthenticated() && !req.user.admin){
            req.session.error = 'You must be an admin to make a post to this route.';
            res.redirect('/signin');
            return next();
        }

        var eventObj = {
            date: Date.now(),
            week: funct.weekNum,
            name: req.body.name,
            trigger: req.body.trigger,
        };
        console.log(eventObj);

        //get current info from db
        var trigger = funct.getOne('triggers', req.body.trigger);
        var currentPoints = funct.getOne('contestants', req.body.name.toLowerCase()).points;

        var contestantObj = {
            points: currentPoints+trigger.points,
            events: [eventObj]
        };
        console.log(contestantObj);

        funct.postEvent(eventObj).then(function(result){
            console.log(util.inspect(result));
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
