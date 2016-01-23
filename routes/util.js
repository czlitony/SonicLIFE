var logger = require('./log').logger;  

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


module.exports.check_request_content = check_request_content;