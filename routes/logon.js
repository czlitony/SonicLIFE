'use strict';
var express = require('express'),
    router = express.Router(),
    uuid = require('node-uuid'),  
    // CACHE = require('./cache').cache,
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
                req.session.regenerate(function(err){
                    req.session.sessionState = {};
                    req.session.sessionState["authenticated"] = true;
                    req.session.sessionState["role"] = documents[0]['role'];
                    req.session.sessionState["username"] = documents[0]['username'];
                    // req.session.save();
                    let result = {'session_id': req.sessionID};
                    logger.info('user '+ body['username'] +' logon.');
                    res.json(result);
                });
            }else{
                res.status(400).json({'message' : 'wrong password'});
            }

        }else{
            res.status(400).json({'message':'Can not find user'});
        }
    });
});

router.get('/', checkUserSessionIdHandler(false), function(req, res, next) {
    
    // logger.debug(req.params.id);
    // let body = req.body;

    let result = {};
    // let cache_result = CACHE.restore(req.params.id);
    let session = req.session;
    if(session.sessionState.authenticated){
        result['authenticated'] = session.sessionState.authenticated;
        result['username'] = session.sessionState.username;
    }else{
        let error = new Error('Can not restore ' + req.sessionID);
        logger.error(error.message);
        error.status = 401;
        next(error);
        return;
    }

    res.json(result);
});

router.delete('/', checkUserSessionIdHandler(false), function(req, res, next){

    // let id = req.params.id;;
    // CACHE.delete(id);
    // CACHE.dump();
    req.session.destroy(function(err){
        res.json({'status':true});
    });
    
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