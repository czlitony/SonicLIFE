var logger = require('./log').logger;
var CACHE = require('./cache').cache;

//if includes function not existed, then use this.
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

function check_request_content(req, target_list){
    logger.debug(Object.keys(req.body));
    l = Object.keys(req.body)
    for(var i=0; i< l.length; i++){
        // console.log(itr);
        logger.debug('checking '+l[i]);
        if(!target_list.includes(l[i])){
            return false;
        }
    }
    return true;
}

function check_input_handler(target){
    return function (req, res, next){
        body = req.body;

        if(!check_request_content(req, target)){
            var err = new Error('Unexpected input');
            logger.error('Unexpected input')
            err.status = 401;
            next(err);
            return;
        }
        next();
    }
}

function check_user_session_id_handler(req, res, next){
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

function check_admin_session_id_handler(req, res, next){
    logger.debug('restore my session');
    logger.debug(req.params.id);
    if (CACHE.restore(req.params.id)){
        var result = CACHE.restore(req.params.id);
    }else{
        logger.error("can't restore a session");
        //Jump to error handle.
        var err = new Error('Wrong session_id');
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

module.exports.check_input_handler = check_input_handler;
module.exports.check_user_session_id_handler = check_user_session_id_handler;
module.exports.check_admin_session_id_handler = check_admin_session_id_handler;