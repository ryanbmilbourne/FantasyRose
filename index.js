var express = require('express'),
    path = require('path'),
    util = require('util'),
    exphbs = require('express-handlebars'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    TwitterStrategy = require('passport-twitter'),
    GoogleStrategy = require('passport-google'),
    FacebookStrategy = require('passport-facebook'),
    config = require('./config.js'), //tokens and private stuff
    funct = require('./functions.js'); //has helper functions for passport and db work

var app = express();

//================
//Passport middleware
//================

// Passport session setup.
passport.serializeUser(function(user, done) {
    console.log("serializing " + user.username);
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    console.log("deserializing " + obj);
    done(null, obj);
});

//Local sign-in
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
                req.session.error = 'Could not log user in.  Try again.'; //for user
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
                req.session.error = 'That username is taken! Please try a different one.'; //for user
            }
            done(null, user);
        })
        .fail(function(err){
            console.err('error: '+err.body);
        });
    }
));

//================
//Configure express
//================

app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) { res.locals.error = err; }
  if (msg) { res.locals.notice = msg; }
  if (success)  { res.locals.success = success; }

  next();
});

app.use('/icons',express.static(path.join(__dirname, 'public/icons')));
app.use('/images',express.static(path.join(__dirname, 'public/images')));
app.use('/layouts',express.static(path.join(__dirname, 'views/layouts')));

// Configure express to use handlebars templates
var hbs = exphbs.create({
    defaultLayout: 'main',
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

//================
//Routes
//================

//home
app.get('/', function(req, res){
    funct.getContestants().then(function(results){
        res.render('home', {user: req.user, girls: results});
    }).fail(function(err){
        res.render('home', {user: req.user, girls: []});
        req.session.failure= 'Error fetching contestant database'+err.body;
    });
});

//rules page
app.get('/rules', function(req, res){
    res.render('rules', {});
});

//basic middleware for admin related pages to check for authentication first.
app.use('/admin', function(req, res, next){
    if(req.isAuthenticated()){ return next();}
    req.session.error = 'You must be signed in to view the requested page.';
    res.redirect('/signin');
});

//admin page
app.get('/admin', function(req, res){
    funct.getContestants().then(function(results){
        console.log(util.inspect(results));
        res.render('admin', {user: req.user, girls: results});
    }).fail(function(err){
        res.render('admin', {user: req.user, girls: []});
        req.session.failure= 'Error fetching contestant database'+err.body;
    });
});

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

//Start listening!
var port = 3000;
app.listen(port);
console.log('listening on ' + port);

