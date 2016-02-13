'use strict';
var express = require('express');
var router = express.Router();
var db = require('./db');
var logger = require('./log').logger; 
var ObjectID = require('mongodb').ObjectID;
var APIError = require('./error').APIError,
    ErrorType = require('./error').ErrorType;
var checkInputHandler = require('./util').checkInputHandler,
    checkUserSessionIdHandler = require('./util').checkUserSessionIdHandler,
    genericQuery = require('./util').genericQuery;
var async = require('async');

router.get('/', genericQuery('schedule'));

router.post('/', checkUserSessionIdHandler(true), checkInputHandler(['dish_id','day']), function(req, res, next){
    let body = req.body;

    if(body instanceof Array){
        async.each(body, function(bodyItem, callback){
            async.series([
                function(callback){
                    isExisted(bodyItem, callback);
                }, 
                function(callback){
                    isIdValid(bodyItem, callback);
                }
            ],
            function(err, result){
                if(err){
                    callback(err);
                    return;
                }
                callback();
            });
            
        }, function(err, result){
            if(err){
                next(err);
                return;
            }
            insert(body);
        });
    }else{
        async.series([
            function(callback){
                isExisted(body, callback);
            }, 
            function(callback){
                isIdValid(body, callback);
            }, 
            function(callback){
                insert(body, callback);
            }
        ],
        function(err, result){
            if(err){
                next(err);
                return;
            }
        });
    }

    function insert(body){
        let promise_result = db.insert('schedule', body);

        promise_result.then(function(result, err){
            if(err){
                let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'INSERT(schedule)', err.message);
                logger.error(err.message);
                next(new_err);
                return;
            }
            logger.debug(result);
            res.status(200).json(result['ops']);
        });
    }

    function isIdValid(item, callback){
        let data = {'_id' : ObjectID.createFromHexString(item['dish_id'])};
        db.find('menu', data).toArray(function(error, docments){
            if(error){
                let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(menu)', error.message);
                logger.error(error.message);
                callback(new_err);
                return;
            }

            if(docments.length != 1){
                let error = new APIError(ErrorType.INVAILD_MENU_ID, item['dish_id']);
                logger.error(error.message);
                callback(error);
                return;
            }
            callback();
        }); 
    }

    function isExisted(body, callback){
        let data = {};
        data['dish_id'] = body['dish_id'];
        data['day'] = body['day'];
        if(typeof data['dish_id'] != 'string'){
            let error = new APIError(ErrorType.TYPE_ILLEGAL, 'dish_id', 'String');
            logger.error(error.toJSON());
            callback(error);
            return;
        }
        if(typeof data['day'] != 'number'){
            let error = new APIError(ErrorType.TYPE_ILLEGAL, 'day', 'Number');
            logger.error(error.toJSON());
            callback(error);
            return;
        }

        db.find('schedule', data).toArray(function(error, docments){
            if(error){
                let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(schedule)', error.message);
                logger.error(error.message);
                callback(new_err);
                return;
            }

            if(docments.length >= 1){
                let error = new APIError(ErrorType.SCHEDULE_EXISTED, body['dish_id'], body['day']);
                logger.error(error.message);
                callback(error);
                return;
            }
            callback();
        });    
    }

});


module.exports = router;