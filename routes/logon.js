'use strict';
var express = require('express'),
    router = express.Router(),
    db = require('./db'),
    logger = require('./log').logger,
    checkInputHandler = require('./util').checkInputHandler,
    checkUserSessionIdHandler = require('./util').checkUserSessionIdHandler,
    APIError = require('./error').APIError,
    ErrorType = require('./error').ErrorType;
const crypto = require('crypto');

router.post('/', checkInputHandler(['username', 'password'], true), function(req, res, next) {

    let body = req.body;

    let result = db.find('user', { 'username' : body['username']});
    result.toArray(function(err, documents){
        
        if(err){
            let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND', err.message);
            logger.error(err.message);
            next(new_err);
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
                let new_err = new APIError(ErrorType.LOGIN_FAIL, body['username']);
                res.status(new_err.status).json(new_err.toJSON());
            }

        }else{
            let new_err = new APIError(ErrorType.LOGIN_FAIL, body['username']);
            res.status(new_err.status).json(new_err.toJSON());
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
        let error = new APIError(ErrorType.CHECK_SID_FAIL, req.sessionID);
        logger.error(error.toJSON());
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
            let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(user)', err.message);
            logger.error(err.message);
            next(new_err);
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
                    let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'INSERT(user)', err.message);
                    logger.error(err);
                    logger.debug(result);
                    next(new_err);
                    return;
                }
                logger.debug(result);
                res.status(200).json({'status':true});
            });
            
        }else{
            let new_err = new APIError(ErrorType.USER_EXISTED, body['username']);
            res.status(new_err.status).json(new_err.toJSON());
        }
    })

});

module.exports = router;