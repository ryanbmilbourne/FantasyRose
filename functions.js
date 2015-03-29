var bcrypt = require('bcryptjs'),
    util = require('util'),
    fs = require('fs'),
    Q = require('q'),
    config = require('./config.js'), //config file contains all tokens and other private info
    db = require('orchestrate')(config.db); //config.db holds Orchestrate token

var weekNum = 3;

var getCollection = function(collection){
    var deferred = Q.defer();
    db.list(collection, {limit:50}).then(function(result){
        console.log(collection+': got %s entries',result.body.count);
        //console.log(util.inspect(result.body.results));
        deferred.resolve(result.body.results);
    }).fail(function(err){
        console.err('get fail: '+err.body);
        deferred.reject(new Error(err.body));
    });
    return deferred.promise;
};


var putToCollection = function(collection, key, obj){
    var deferred = Q.defer();
    db.put(collection, key, obj).then(function(result){
        console.log('put item: %s', key);
        deferred.resolve(result);
    }).fail(function(err){
        console.err('error putting item: '+err.body);
        deferred.reject(new Error(err.body));
    });
    return deferred.promise;
};

exports.getTriggers = getCollection.bind(null,'triggers');
exports.getContestants = getCollection.bind(null,'contestants');

exports.putTrigger = putToCollection.bind(null, 'triggers');

exports.postEvent = function(obj){
    var deferred = Q.defer();
    db.post('events', obj).then(function(result){
        console.log('post item: %s', util.inspect(obj));
        deferred.resolve(result);
    }).fail(function(err){
        console.err('error putting item: '+err.body);
        deferred.reject(new Error(err.body));
    });
    return deferred.promise;
};

//get an item from a collection
exports.getOne = function(collection, key){
    var deferred = Q.defer();
    db.get(collection, key).then(function(result){
        console.log('got \n%s \nfrom %s', util.inspect(result.body), collection);
        deferred.resolve(result.body);
    }).fail(function(err){
        console.err('get fail: '+err.body);
        deferred.reject(new Error(err.body));
    });
    return deferred.promise;
};

//add contestant to db
exports.addContestant = function(key, obj){
    var deferred = Q.defer();
    db.put('contestants', key, obj).then(function(result){
        console.log('added contestant: %s', key);
        deferred.resolve(result);
    }).fail(function(err){
        console.err('error adding contestant: '+err.body);
        deferred.reject(new Error(err.body));
    });
    return deferred.promise;
};

// for local signup
exports.localReg = function(username, password) {
    var deferred = Q.defer();
    var hash = bcrypt.hashSync(password, 8);
    var user = {
        "username": username,
        "password": hash,
        "avatar": "icons/default-nyan.png"
    };

    //did we already create this user?
    db.get('local-users', username).then(function(result){
        console.log('user already exists');
        deferred.resolve(false);
    }).fail(function(result){
        console.log(result.body);
        if(result.body.message === 'The requested items could not be found.'){
            db.put('local-users', username, user).then(function(){
                console.log('created' + user);
                deferred.resolve(user);
            }).fail(function(err){
                console.err('put fail: '+err.body);
                deferred.reject(new Error(err.body));
            });
        } else {
            deferred.reject(new Error(result.body));
        }
    });
    return deferred.promise;
};

// for local sign-in
exports.localAuth = function(username, password){
exports.weekNum = weekNum;
    var deferred = Q.defer();

    db.get('local-users', username).then(function(result){
        console.log('found user '+username);
        var hash = result.body.password;
        console.log(hash);
        if(bcrypt.compareSync(password, hash)) {
            console.log('user auth pass: '+username);
            deferred.resolve(result.body);
        } else {
            console.log('user auth fail: '+username);
            deferred.resolve(false);
        }
    }).fail(function(err){
        if(err.body.message === 'The requested items could not be found.'){
            console.log('user not found: '+username);
            deferred.resolve(false);
        } else {
            deferred.reject(new Error(err));
        }
    });
    return deferred.promise;
};

