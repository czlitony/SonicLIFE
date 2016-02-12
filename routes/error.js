'use strict';
var logger = require('./log').logger;

var ErrorType = { 
    GENERAL_ERROR : 1,
    LOGIN_FAIL : 2,
    REGISTER_FAIL_USER_EXIST : 3,
    CHECK_SID_FAIL : 4,
    REQUEST_CONTENT_NOT_MATCH : 5,
    RATE_TYPE_ILLEGAL : 6,
    DB_OPERATE_FAIL : 7,
    USER_EXISTED : 8,
    DISH_EXISTED : 9,
    ROUTE_NOT_FOUND : 10,
    LDAP_USER_INVALID : 11,
    LDAP_USER_LOCKED : 12
}

var ErrorMap = {};

ErrorMap[ErrorType.GENERAL_ERROR] = {'code' : 500, 'error_code':1, 'msg' : 'general error', 'param_count' : 0};
ErrorMap[ErrorType.LOGIN_FAIL] = {'code' : 500, 'error_code':2, 'msg' : 'login \'{1}\' fail, please check the username and password', 'param_count' : 1};
ErrorMap[ErrorType.REGISTER_FAIL_USER_EXIST] = {'code' : 500, 'error_code':3, 'msg' : 'register \'{1}\' fail, user exist.', 'param_count' : 1};
ErrorMap[ErrorType.CHECK_SID_FAIL] = {'code' : 500, 'error_code':4, 'msg' : 'check sid \'{1}\' fail, it\'s unauthenticated.', 'param_count' : 1};
ErrorMap[ErrorType.REQUEST_CONTENT_NOT_MATCH] = {'code' : 500, 'error_code':5, 'msg' : 'request key illegal, expect \'{1}\'', 'param_count' : 1};
ErrorMap[ErrorType.RATE_TYPE_ILLEGAL] = {'code' : 500, 'error_code':6, 'msg' : 'rate is not a Number', 'param_count' : 0};
ErrorMap[ErrorType.DB_OPERATE_FAIL] = {'code' : 500, 'error_code':7, 'msg' : 'ACTION: {1}, MSG: {2}', 'param_count' : 2};
ErrorMap[ErrorType.USER_EXISTED] = {'code' : 500, 'error_code':8, 'msg' : 'user \'{1}\' existed.', 'param_count' : 1};
ErrorMap[ErrorType.DISH_EXISTED] = {'code' : 500, 'error_code':9, 'msg' : 'vender \'{1}\' dish \'{2}\' existed.', 'param_count' : 2};
ErrorMap[ErrorType.ROUTE_NOT_FOUND] = {'code' : 404, 'error_code':10, 'msg' : 'route \'{1}\' invaild', 'param_count' : 1};
ErrorMap[ErrorType.LDAP_USER_INVALID] = {'code' : 404, 'error_code':11, 'msg' : 'LDAP user \'{1}\' invaild', 'param_count' : 1};
ErrorMap[ErrorType.LDAP_USER_LOCKED] = {'code' : 404, 'error_code':12, 'msg' : 'LDAP user \'{1}\' locked', 'param_count' : 1};

Object.defineProperty(ErrorMap, 'key', {
  enumerable: true,
  configurable: false,
  writable: false,
  value: 'static'
});

Object.defineProperty(ErrorType, 'key', {
  enumerable: true,
  configurable: false,
  writable: false,
  value: 'static'
});

Object.seal(ErrorMap);
Object.seal(ErrorType);

class APIError extends Error{
    // receive 2 parameters currently, type and replaceString
    constructor() {
        super();
        this.type = arguments[0];

        this.paramList = arguments;
        if((this.paramList.length - 1) != ErrorMap[this.type]['param_count']){
            logger.error('paramList not match the required length');
            throw new Error('paramList not match the required length');
        }
    }
    
    get status(){
        return ErrorMap[this.type]['code'];
    }

    toJSON(){
        let finalMsg = ErrorMap[this.type]['msg'];
        for(let i=1; i<this.paramList.length; i++){
            let pattern = '{' + i.toString() + '}';
            finalMsg = finalMsg.replace(pattern, this.paramList[i]);
        }
        logger.debug('finalMsg: ' + finalMsg);
        let result = {
            error_code : ErrorMap[this.type]['error_code'],
            message : finalMsg
        }
        return result;
    }
}

exports.APIError = APIError;
exports.ErrorType = ErrorType;