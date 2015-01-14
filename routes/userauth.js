/*
 * User Sign-in and Sign-up Routes
 */
module.exports = function(app, passport, LocalStrategy, funct){
    //========================
    // Passport session setup.
    //========================

    //serialize user for term of the session. dummy for now.
    passport.serializeUser(function(user, done) {
        console.log("serializing " + user.username);
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        console.log("deserializing " + obj);
        done(null, obj);
    });

    //local sign-in
    passport.use('local-signin', new LocalStrategy(
        {passReqToCallback: true},
        function(req, username, password, done){
            funct.localAuth(username, password, done)
            .then(function(user){
                if(user){
                    console.log('logged in as: '+user.username);
                    req.session.success = user.username + ' logged in.';
                } else {
                    console.log('could not log in');
                    req.session.error = 'Could not log user in.  Try again.'; //Nicely formatted for front-end
                }
                done(null, user);
            })
            .fail(function(err){
                console.err('error: '+err.body);
            });
        }
    ));

    //local sign-up
    passport.use('local-signup', new LocalStrategy(
        {passReqToCallback: true},
        function(req, username, password, done){
            funct.localReg(username, password, done)
            .then(function(user){
                if(user){
                    console.log('registered '+user.username);
                    req.session.success = user.username + ' registered and logged in.';
                } else {
                    console.log('could not register user');
                    req.session.error = 'That username is taken! Please try a different one.'; //Nicely formatted for front-end
                }
                done(null, user);
            })
            .fail(function(err){
                console.err('error: '+err.body);
            });
        }
    ));

    //========================
    //Routes
    //========================

    //sign-in/up page
    app.get('/signin', function(req, res){
        res.render('signin');
    });

    //handle signup route
    app.post('/local-reg', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signin'
    }) );

    //handle sign-in route
    app.post('/login', passport.authenticate('local-signin', { 
        successRedirect: '/',
        failureRedirect: '/signin'
    }) );

    //logout
    app.get('/logout', function(req, res){
        var name = req.user.username;
        console.log("LOGGIN OUT " + req.user.username)
        req.logout();
        res.redirect('/');
        req.session.notice = "You have successfully been logged out " + name + "!";
    });
};
