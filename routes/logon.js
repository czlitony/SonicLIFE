'use strict';
var express = require('express'),
    router = express.Router(),
    uuid = require('node-uuid'),  
    CACHE = require('./cache').cache,
    db = require('./db'),
    logger = require('./log').logger,
    checkInputHandler = require('./util').checkInputHandler,
    checkUserSessionIdHandler = require('./util').checkUserSessionIdHandler;
const crypto = require('crypto');

router.post('/', checkInputHandler(['username', 'password'], true), function(req, res, next) {

    let body = req.body;

    let result = db.find('user', { 'username' : body['username']});
    result.toArray(function(err, documents){
        
        if(err){
            logger.error(err.message);
            err.status = 401;
            next(err);
            return;
        }

        if(documents.length == 1){
            logger.info('User found: ' + documents[0]);
            let salt = documents[0]['salt'];
            let record = {};
            let hash = crypto.createHash('sha256');
            hash.update(body['password'] + salt); 

            if(hash.digest('hex') == documents[0]['password']){
                let result = {};
                let cache_result = CACHE.hasUser(body['username']);
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

router.get('/:id', checkUserSessionIdHandler, function(req, res, next) {
    
    logger.debug(req.params.id);
    let body = req.body;
    let result = {};
    let cache_result = CACHE.restore(req.params.id);
    if(cache_result){
        result['session_id'] = cache_result;
    }else{
        let error = new Error('Can not restore ' + req.params.id);
        logger.error(error.message);
        error.status = 401;
        next(error);
        return;
    }
    logger.info('user '+ body['username'] +' created');
    res.json(result);
});

router.delete('/:id', checkUserSessionIdHandler, function(req, res, next){

    let id = req.params.id;;
    CACHE.delete(id);
    CACHE.dump();
    res.json({'status':true});
});

router.post('/register', checkInputHandler(['username', 'password'], true), function(req, res, next){
    
    let body = req.body;

    let result = db.find('user', { 'username' : body['username']});
    result.toArray(function(err, documents){
        
        if(err){
            logger.error(err.message);
            next(err);
            return;
        }

        if(documents.length == 0){
            let salt = uuid.v1(),
                record = {},
                hash = crypto.createHash('sha256');
            
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
                res.status(200).json({'status':true});
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