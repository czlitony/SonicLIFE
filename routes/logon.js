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
    if(!req.is('application/json')){
        var err = new Error('expect a json format');
        err.status = 401;
        next(err);
    }

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
    res.status(err.status).json({'message' : err.message});
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
    var err = new Error('Wrong session_id');
    err.status = 404;
    // console.error(err.stack);
    res.status(err.status).json({'message' : err.message});
})

router.delete('/:id', function(req, res, next){
    id = req.params.id;

    if(id && CACHE.hasKey(id)){
        CACHE.delete(id);
        CACHE.dump();
    }else{
        throw new Error("id is null");
    }
    res.json({'status':true});

}, function(err, req, res, next) {
    var err = new Error('session id not existed.');
    err.status = 404;
    console.error(err.stack);
    res.status(err.status).json({'message' : err.message});
})

router.post('/register', function(req, res, next){
    body = req.body;
    if(!check_register_request(req, ['username', 'password'])){
        var err = new Error('Unexpected input');
        console.log('Unexpected input')
        err.status = 401;
        next(err);
    }

    result = db.find('user', { 'username' : body['username']});
    result.toArray(function(err, documents){
        if(err){
            console.log(err.message)
            next(err);
        }
        if(documents.length == 0){
            db.insert('user', body);

            res.status(200).json();
        }else{
            res.status(400).json({'message':'user existed.'});
        }
    })


},function(err, req, res, next){
    // res.status(err.status).json({'message' : err.message});
    // res.status(err.status).send("Error");
    res.send(err.message);
})

function check_register_request(req, target_list){
    console.log(Object.keys(req.body));
    for(itr in Object.keys(req.body)){
        console.log(itr);
        if(!target_list.includes(itr)){
            return false;
        }
    }
    return true;
}

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}
module.exports = router;