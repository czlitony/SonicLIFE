var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');  
var CACHE = require('./cache').cache;
var db = require('./db');
var logger = require('./log').logger;  

var check_input_handler = require('./util').check_input_handler;
var check_user_session_id_handler = require('./util').check_user_session_id_handler;
const crypto = require('crypto');

// var CACHE = new Cache();
// var session = require('express-session');

//This will be matched first.
router.use(function(req, res, next){

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

router.post('/', 
    check_input_handler(['username', 'password']), 
    function(req, res, next) {

    body = req.body;

    result = db.find('user', { 'username' : body['username']});
    result.toArray(function(err, documents){
        
        if(err){
            logger.error(err.message);
            err.status = 401;
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
router.get('/:id', 
    check_user_session_id_handler, 
    function(req, res, next) {
    
    logger.debug(req.params.id);
    res.send(req['state']);
});

router.delete('/:id', 
    check_user_session_id_handler, 
    function(req, res, next){

    id = req.params.id;;
    CACHE.delete(id);
    CACHE.dump();
    res.json({'status':true});
});

router.post('/register', 
    check_input_handler(['username', 'password']), 
    function(req, res, next){
    
    body = req.body;

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
            promise_result.then(function(result, err){
                if(err){
                    logger.error(err);
                    logger.debug(result);
                    err.status = 401;
                    next(err);
                    return;
                }
                logger.debug(result);
                res.status(200).send();
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

module.exports = router;