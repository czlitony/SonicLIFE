'use strict';
var logger = require('./log').logger,
    APIError = require('./error').APIError,
    ErrorType = require('./error').ErrorType;
var db = require('./db');

//if includes function not existed, then use this.
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {

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

function checkRequestContent(req, target_list, strict){

    if(req.body instanceof Array){
        for(let i=0; i<req.body.length; i++){
            if(!checkObject(req.body[i])){
                return false;
            }
        }
        return true;
    }else{
        return checkObject(req.body);
    }

    function checkObject(obj){
        if(strict && target_list.length !== Object.keys(obj).length){
            req['error_reason'] = "input parameters length not match";
            return false;
        }

        if( obj !== undefined && !req.is('application/json')){
            // need a return here, or the program will continue.
            req['error_reason'] = "input parameters must be json";
            return false;
        }

        logger.debug(Object.keys(obj));
        let l = Object.keys(obj)
        for(var i=0; i< l.length; i++){
            // console.log(itr);
            logger.debug('checking '+l[i]);
            if(!target_list.includes(l[i])){
                logger.debug('return false');
                return false;
            }
        }
        return true;
    }
}

function checkInputHandler(target, strict){
    return function (req, res, next){

        if(!checkRequestContent(req, target, strict)){
            logger.error('Error :' + req['error_reason']);
            var err = new APIError(ErrorType.REQUEST_CONTENT_NOT_MATCH, target);
            next(err);
            return;
        }
        next();
    }
}

function checkUserSessionIdHandler(isAdmin){
    return function(req, res, next){
        logger.debug('Cookies is: ' + req.cookies['connect.sid']);
        let session = req.session;

        if(session.sessionState){
            if(session.sessionState['authenticated'] && isAdmin === false){
                logger.debug("successfuly restore a user session");
                next();
            }else if(session.sessionState['authenticated'] && isAdmin === true && session.sessionState['role'] == "admin"){
                logger.debug("successfuly restore a admin session");
                next();
            }else{
                res.redirect("/logon");
                return;
            }
        }else{
            logger.error("can't restore a session");
            //Jump to error handle.
            console.log(req.cookies['connect.sid']);
            var err = new APIError(ErrorType.CHECK_SID_FAIL, req.cookies['connect.sid']);
            next(err);
            return;
        }
    };
}

function genericQuery(collection){
    return function(req, res, next){
        let cursor = db.find(collection, {});
        let page = req.query.page;
        if(page !== undefined && page > 0){
            cursor = cursor.skip((page-1)*10).limit(10);
        }

        cursor.toArray(function(error, docments){
            if(error){
                let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND('+collection+')', error.message);
                logger.error(error.message);
                next(new_err);
                return;
            }
            logger.debug(req.originalUrl + ' ' + docments);
            res.json(docments);
        });
    };
}

module.exports.checkInputHandler = checkInputHandler;
module.exports.checkUserSessionIdHandler = checkUserSessionIdHandler;
module.exports.genericQuery = genericQuery;