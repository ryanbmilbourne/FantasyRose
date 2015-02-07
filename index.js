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

app.set('port', (process.env.PORT || 5000));
app.use('/icons',express.static(path.join(__dirname, 'public/icons')));
app.use('/images',express.static(path.join(__dirname, 'public/images')));
app.use('/layouts',express.static(path.join(__dirname, 'views/layouts')));
app.use('/js',express.static(path.join(__dirname, 'public/javascripts')));

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
        res.render('home', {week: funct.weekNum, user: req.user, girls: results});
    }).fail(function(err){
        res.render('home', {week: funct.weekNum, user: req.user, girls: []});
        req.session.failure= 'Error fetching contestant database'+err.body;
    });
});

require('./routes/userauth.js')(app, passport, LocalStrategy, funct);

//rules page
require('./routes/rules.js')(app, funct);

//contestants page
require('./routes/contestants.js')(app, funct);

//event reporting page
require('./routes/events.js')(app, util, funct);

//admin routes
require('./routes/admin.js')(app, util, funct);

//api routes
require('./routes/api.js')(app, util, funct);

//Start listening!
app.listen(app.get('port'), function(){
    console.log("Node app is running at localhost:" + app.get('port'));
});

