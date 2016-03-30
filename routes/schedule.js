'use strict';
var express = require('express');
var router = express.Router();
var db = require('./db');
var logger = require('./log').logger; 
var ObjectID = require('mongodb').ObjectID;
var APIError = require('./error').APIError,
    ErrorType = require('./error').ErrorType;
var checkUserSessionIdHandler = require('./util').checkUserSessionIdHandler,
    genericQuery = require('./util').genericQuery,
    inputChecker = require('./util').inputChecker;
var async = require('async');
var Schedule = require('./models/schedule_model').Schedule;

router.get('/', function(req, res, next){
    let s = new Schedule();
    
    let page = req.query.page;
    let day = req.query.day;
    let type = req.query.type;

    logger.debug('day ' + day);
    logger.debug('type ' + type);
    let selector = {};
    
    if(day && day >= 1 && day <= 7){
        selector = {'day' : parseInt(day)};
    }

    if(type){
        selector['type'] = type;
    }
    
    var promise;
    if(page !== undefined && page > 0){
        cursor = cursor.skip((page-1)*10).limit(10);
        promise = s.find(selector, ((page-1)*10), 10);
    }else{
        promise = s.find(selector);
    }

    promise.then(function(val){
        res.status(200).json(val);
    }).catch(function(err){
        next(err);
    })
});

router.post('/', checkUserSessionIdHandler(true), 
    inputChecker({'dish_id':'string','day':'number','type':'string'}, true), 
    function(req, res, next){
    
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
        // let promise_result = db.insert('schedule', body);

        // promise_result.then(function(result, err){
        //     if(err){
        //         let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'INSERT(schedule)', err.message);
        //         logger.error(err.message);
        //         next(new_err);
        //         return;
        //     }
        //     logger.debug(result);
        //     res.status(200).json(result['ops']);
        // });

        let s = new Schedule();
        let promise = s.insert(body);
        promise.then(function(val){
            res.status(200).json(val);
        }).catch(function(err){
            let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'INSERT(schedule)', err.message);
            logger.error(err.message);
            next(new_err);
            return;
        })
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
        data['type'] = body['type'];
        
        if(data['day'] > 7 || data['day'] < 1){
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
                let error = new APIError(ErrorType.SCHEDULE_EXISTED, body['dish_id'], body['day'], body['type']);
                logger.error(error.message);
                callback(error);
                return;
            }
            callback();
        });    
    }

});

router.delete('/', checkUserSessionIdHandler(true), inputChecker({'schedule_id':['string']}, true), function(req, res, next){
    let delete_list = req.body['schedule_id'];

    let translated_list = [];
    let a_tracker = '';
    try{
        for(let i=0; i<delete_list.length; i++){
            a_tracker = delete_list[i];
            translated_list.push(ObjectID.createFromHexString(a_tracker));
        }
    }catch(e){
        let error = new APIError(ErrorType.CAN_NOT_CREATE_OBJECTID, a_tracker);
        logger.error(error.message);
        next(error);
        return;
    }

    // logger.debug('dish_id is ' + req.params.dish_id);
    db.remove('schedule', {'_id': {'$in' : translated_list}})
        .then(function(result, error){
            logger.debug(result);
            logger.debug(error);
            if(error){
                let error = new APIError(ErrorType.DB_OPERATE_FAIL, 'REMOVE(schedule)', err.message);
                logger.error(error.message);
                next(error);
                return;
            }
            res.sendStatus(200);
        });
});

router.put('/', 
            checkUserSessionIdHandler(true), 
            inputChecker({'_id':'string', 'dish_id':'string','day':'number', 'type':'string'}, false), 
            function(req, res, next){
    if(!req.body['_id']){
        let error = new APIError(ErrorType.NEED_A_ID);
        logger.error(error.message);
        next(error);
        return;
    }

    if(data['day'] > 7 || data['day'] < 1){
        let error = new APIError(ErrorType.TYPE_ILLEGAL, 'day', 'Number');
        logger.error(error.toJSON());
        callback(error);
        return;
    }

    // let selector = {'_id' : ObjectID.createFromHexString(req.body['_id'])};
    try{
        var selector = {'_id' : ObjectID.createFromHexString(req.body['_id'])}
    }catch(e){
        let error = new APIError(ErrorType.CAN_NOT_CREATE_OBJECTID, req.body['_id']);
        logger.error(error.message);
        next(error);
        return;
    }

    let target = {};
    if(req.body['dish_id']){
        target['dish_id'] = req.body['dish_id'];
    }

    if(req.body['day']){
        target['day'] = req.body['day'];
    }

    if(req.body['type']){
        target['type'] = req.body['type'];
    }

    db.update('schedule', selector, {'$set': target}, {})
        .then(function(update_result, error){
            if(error){
                let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'UPDATE(schedule)', error.message);
                logger.error(error.message);
                next(new_err);
                return;
            }
            logger.debug(update_result);
            res.sendStatus(200);
        });


    res.sendStatus(200);
});

module.exports = router;