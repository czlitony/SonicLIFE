var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');  
var Cache = require('./cache');
var db = require('./db');

var CACHE = new Cache();
// var session = require('express-session');

//This will be matched first.
router.use(function(req, res, next){    
    //input check
    console.log(req.method);
    if(req.method == 'POST'){
        console.log("Check request body");
        if(req.body.hasOwnProperty('username') && req.body.hasOwnProperty('password')){
            console.log('input match');
        }else{
            var err = new Error('Unexpected input');
            err.status = 403;
            next(err);
        }
    }else if(req.method == 'GET'){
        console.log("get a GET request");
    }else if(req.method == 'DELETE'){
        console.log("get a DELETE request");
    }
    next();
}, function(err, req, res, next){
    // console.error(err.stack);
    res.status(err.status).send(err.message);
});

router.post('/', function(req, res, next) {
    result = {
        'session_id' : uuid.v1()
    }

    CACHE.save(result['session_id'], {'state': true });
    CACHE.dump();
    res.json(result);

});

//Each route can have a err handler.
//FIXME: need to find a way to make error auto handled.
//Maybe we can add this:
//router.use(function(err, req, res, next){
// DO MAGIC
//})
router.get('/:id', function(req, res, next){
    
    id = req.params.id;

    if(id === undefined){
        console.log('create a new session');
        
    }else{
        console.log('restore my session');
        console.log(req.params.id);
        if (CACHE.restore(req.params.id)){
            req["state"] = CACHE.restore(req.params.id);
        }else{
            console.log("can't restore a session");
            //Jump to error handle.
            next(new Error());
        }
    }
    //Jump to next handle.
    //next('route') used to jump out this route, all the following handler
    //will be ignored.
    next();
}, function(req, res, next) {
    console.log(req.params.id);
    res.send(req['state']);

}, function(err, req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    console.error(err.stack);
    res.status(err.status).send('Something broke!');
})

router.delete('/:id', function(req, res, next){
    id = req.params.id;

    if(id && CACHE.hasKey(id)){
        CACHE.delete(id);
        CACHE.dump();
    }else{
        throw new Error("id is null");
    }
    res.send("success");

}, function(err, req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    console.error(err.stack);
    res.status(err.status).send('session id not existed.');
})

router.post('/register', function(req, res, next){
    body = req.body;
    db.insert('user', body);
    res.status(200).send();
})

module.exports = router;