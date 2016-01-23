var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');  
var Cache = require('./cache');
var db = require('./db');
var logger = require('./log').logger;  

var check_request_content = require('./util').check_request_content;
const crypto = require('crypto');

var CACHE = new Cache();
// var session = require('express-session');

//This will be matched first.
router.use(function(req, res, next){    
    //input check
    logger.debug('pre check');
    if( req.body == null && !req.is('application/json')){
        var err = new Error('expect a json format');
        err.status = 401;
        next(err);
        // need a return here, or the program will continue.
        return;
    }

    logger.debug(req.method);
    if(req.method == 'POST'){
        logger.debug("Check request body");
        if(req.body.hasOwnProperty('username') && req.body.hasOwnProperty('password')){
            logger.debug('input match');
        }else{
            var err = new Error('Unexpected input');
            err.status = 403;
            next(err);
            return;
        }
    }else if(req.method == 'GET'){
        logger.debug("get a GET request");
    }else if(req.method == 'DELETE'){
        logger.debug("get a DELETE request");
    }
    next();
});

router.post('/', function(req, res, next) {

    body = req.body;

    if(!check_request_content(req, ['username', 'password'])){
        var err = new Error('Unexpected input');
        logger.error('Unexpected input')
        err.status = 401;
        next(err);
        return;
    }

    result = db.find('user', { 'username' : body['username']});
    result.toArray(function(err, documents){
        
        if(err){
            logger.error(err.message);
            next(err);
            return;
        }

        if(documents.length == 1){
            logger.info('User found: ' + documents[0]);
            salt = documents[0]['salt'];
            record = {};
            var hash = crypto.createHash('sha256');
            hash.update(body['password'] + salt); 

            if(hash.digest('hex') == documents[0]['password']){
                result = {};
                var cache_result = CACHE.hasUser(body['username']);
                if(cache_result){
                    result['session_id'] = cache_result;
                }else{
                    result = {
                        'session_id' : uuid.v1()
                    };

                    CACHE.save(result['session_id'], {'state': true, 
                                                      'username': documents[0]['username'],
                                                      'role' : documents[0]['role']
                                                  });
                    CACHE.dump();
                }
                logger.info('user '+ body['username'] +' created');
                res.json(result);
            }else{
                res.status(400).json({'message' : 'wrong password'});
            }

        }else{
            res.status(400).json({'message':'Can not find user'});
        }
    });
});

//Each route can have a err handler.
//FIXME: need to find a way to make error auto handled.
//Maybe we can add this:
//router.use(function(err, req, res, next){
// DO MAGIC
//})
router.get('/:id', check_session_id, function(req, res, next) {
    logger.debug(req.params.id);
    res.send(req['state']);
});

router.delete('/:id', check_session_id, function(req, res, next){

    id = req.params.id;;
    CACHE.delete(id);
    CACHE.dump();
    res.json({'status':true});
});

router.post('/register', function(req, res, next){
    
    body = req.body;
    if(!check_request_content(req, ['username', 'password'])){
        var err = new Error('Unexpected input');
        logger.error('Unexpected input');
        err.status = 401;
        next(err);
        return;
    }

    result = db.find('user', { 'username' : body['username']});
    result.toArray(function(err, documents){
        
        if(err){
            logger.error(err.message);
            next(err);
            return;
        }

        if(documents.length == 0){
            salt = uuid.v1();
            record = {};
            var hash = crypto.createHash('sha256');
            hash.update(body['password'] + salt);            

            record['username'] = body['username'];
            record['password'] = hash.digest('hex');
            record['salt'] = salt;
            record['role'] = 'user';

            var promise_result = db.insert('user', record);
            promise_result.then(function(err, result){
                console.log(err);
                console.log(result);
                res.status(200).json();
            });
            
        }else{
            res.status(400).json({'message':'user existed.'});
        }
    })

});

router.use(function(err, req, res, next){
    logger.error(err);
    res.status(err.status).json({'message' : err.message});
});

function check_session_id(req, res, next){
    id = req.params.id;

    if(id === undefined){
        logger.error('no session_id');
        
    }else{
        logger.debug('restore my session');
        logger.debug(req.params.id);
        if (CACHE.restore(req.params.id)){
            //JUST FOR FUN FIXME.
            req["state"] = CACHE.restore(req.params.id);
        }else{
            logger.error("can't restore a session");
            //Jump to error handle.
            var err = new Error('Wrong session_id');
            err.status = 400;
            next(err);
            return;
        }
    }
    //Jump to next handle.
    //next('route') used to jump out this route, all the following handler
    //will be ignored.
    next();
};

module.exports = router;