'use strict';
var logger = require('./log').logger,
    CACHE = require('./cache').cache;

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

    if(strict && target_list.length !== Object.keys(req.body).length){
        req['error_reason'] = "input parameters length not match";
        return false;
    }

    if( req.body !== undefined && !req.is('application/json')){
        // need a return here, or the program will continue.
        req['error_reason'] = "input parameters must be json";
        return false;
    }

    logger.debug(Object.keys(req.body));
    let l = Object.keys(req.body)
    for(var i=0; i< l.length; i++){
        // console.log(itr);
        logger.debug('checking '+l[i]);
        if(!target_list.includes(l[i])){
            return false;
        }
    }
    return true;
}

function checkInputHandler(target, strict){
    return function (req, res, next){
        // let body = req.body;

        if(!checkRequestContent(req, target, strict)){
            logger.error('Error :' + req['error_reason']);
            var err = new Error(req['error_reason']);
            err.status = 401;
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
            var err = new Error('Wrong session_id');
            err.status = 400;
            next(err);
            return;
        }
    };
}

module.exports.checkInputHandler = checkInputHandler;
module.exports.checkUserSessionIdHandler = checkUserSessionIdHandler;