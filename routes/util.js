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

function checkUserSessionIdHandler(req, res, next){
    let id = req.params.id;

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

        if(req["state"]["state"] !== true){
            res.redirect("/logon");
            return;
        }
    }
    //Jump to next handle.
    //next('route') used to jump out this route, all the following handler
    //will be ignored.
    next();
};

function checkAdminSessionIdHandler(req, res, next){
    logger.debug('restore my session');
    logger.debug(req.params.id);
    if (CACHE.restore(req.params.id)){
        var result = CACHE.restore(req.params.id);
    }else{
        logger.error("can't restore a session");
        //Jump to error handle.
        let err = new Error('Wrong session_id');
        err.status = 400;
        next(err);
        return;
    }

    if(result['role'] !== 'admin' || result['state'] !== true){
        res.redirect("/logon");
        return;
    }

    next();
};

module.exports.checkInputHandler = checkInputHandler;
module.exports.checkUserSessionIdHandler = checkUserSessionIdHandler;
module.exports.checkAdminSessionIdHandler = checkAdminSessionIdHandler;