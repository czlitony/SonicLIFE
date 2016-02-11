'use strict';
var express = require('express'),
    router = express.Router(),
    uuid = require('node-uuid'),  
    db = require('./db'),
    logger = require('./log').logger,
    checkInputHandler = require('./util').checkInputHandler,
    checkUserSessionIdHandler = require('./util').checkUserSessionIdHandler,
    APIError = require('./error').APIError,
    ErrorType = require('./error').ErrorType;
const crypto = require('crypto');

var ldap = require('ldap-verifyuser');
var ldapConfig = {
    server: 'ldap://10.102.1.51',
    adrdn: 'sv\\',
    adquery: 'DC=sv,DC=us,DC=sonicwall,DC=com',
    debug: false
}

function localAuthenticate(req, res, next){
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
}

function ldapAuthenticate(req, res, next){
    let body = req.body;
    let username = body.username,
        password = body.password;

    logger.debug("start to verifyUser.");
    ldap.verifyUser(ldapConfig, username, password, function(err, data){
        if(err) {
            logger.debug("verifyUser fail.");
            let new_err = new APIError(ErrorType.LOGIN_FAIL, body['username']);
            res.status(new_err.status).json(new_err.toJSON());
        } else {
            console.log('valid?', data.valid);
            console.log('locked?', data.locked);
            console.log('raw data available?', data.raw ? true : false);
            req.session.regenerate(function(err){
                req.session.sessionState = {};
                req.session.sessionState["authenticated"] = true;
                //HOW TO check if it's an admin??
                req.session.sessionState["role"] = 'user';
                req.session.sessionState["username"] = body['username'];
                // req.session.save();
                let result = {'session_id': req.sessionID};
                logger.info('user '+ body['username'] +' logon.');
                res.json(result);
            });
        }
    });
}

var authenticate = localAuthenticate;
console.log('ENV USE_LDAP '+process.env.USE_LDAP);
if(process.env.USE_LDAP == 1){
    console.log('USE LDAP');
    authenticate = ldapAuthenticate;
}

router.post('/', checkInputHandler(['username', 'password'], true), function(req, res, next) {

    authenticate(req, res, next);
});

router.get('/', checkUserSessionIdHandler(false), function(req, res, next) {
    
    let result = {};
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