/*
 * Admin routes
 */

module.exports = function(app, util, funct){
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
};
