'use strict';
var express = require('express');
var router = express.Router();
var CACHE = require('./cache').cache;
var db = require('./db');
var logger = require('./log').logger;
var ObjectID = require('mongodb').ObjectID;
var APIError = require('./error').APIError,
    ErrorType = require('./error').ErrorType;
var inputChecker = require('./util').inputChecker,
    checkUserSessionIdHandler = require('./util').checkUserSessionIdHandler,
    genericQuery = require('./util').genericQuery;



router.get('/', genericQuery('menu'));

//NOTE: give anonymous functions a name is good for debug.
router.post('/', checkUserSessionIdHandler(true), 
    inputChecker({'vender':'string','dish':'string'}, true), function(req, res, next){

    let body = req.body;
    let data = {};
    data['vender'] = body['vender'];
    data['dish'] = body['dish'];

    db.find('menu', data).toArray(function(error, docments){
        if(error){
            let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(menu)', error.message);
            logger.error(error.message);
            next(new_err);
            return;
        }

        if(docments.length >= 1){
            let error = new APIError(ErrorType.DISH_EXISTED, body['vender'], body['dish']);
            logger.error(error.message);
            next(error);
            return;
        }
        
        data['rate'] = { 'times': 0, 'result': 0 };
        var promise_result = db.insert('menu', data);

        //FIXME: the input sequence is different with the offical document.
        //Offical docs: function(err, result)
        //Actual: function(result, err)
        promise_result.then(function(result, err){
            if(err){
                let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'INSERT(menu)', err.message);
                logger.error(err.message);
                next(new_err);
                return;
            }
            logger.debug(result);
            res.status(200).json(result['ops']);
        });
    });


});

router.delete('/', checkUserSessionIdHandler(true), inputChecker({'dish_list':['string']}, true), function(req,res,next){
    let delete_list = req.body['dish_list'];

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
    db.remove('menu', {'_id': {'$in' : translated_list}})
        .then(function(result, error){
            logger.debug(result);
            logger.debug(error);
            if(error){
                let error = new APIError(ErrorType.DB_OPERATE_FAIL, 'REMOVE(menu)', err.message);
                logger.error(error.message);
                next(error);
                return;
            }

            db.remove('schedule', {'dish_id' : {'$in' : delete_list}})
            .then(function(result, error){
                if(error){
                    let error = new APIError(ErrorType.DB_OPERATE_FAIL, 'REMOVE(menu)', err.message);
                    logger.error(error.message);
                    next(error);
                    return;
                }
                res.sendStatus(200);
            })

            db.remove('comments', {'dish_id' : {'$in' : delete_list}})
            .then(function(result, error){
                if(error){
                    let error = new APIError(ErrorType.DB_OPERATE_FAIL, 'REMOVE(menu)', err.message);
                    logger.error(error.message);
                    next(error);
                    return;
                }
                res.sendStatus(200);
            })
        });
});

router.get('/vender', function(req, res, next) {

    let promise_result = db.findDistinct('menu','vender');
    promise_result.then(function(result,err){
         if(err){
            let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND_DISTINCT(menu)', err.message);
            logger.error(err.message);
            next(new_err);
            return;
        }
        logger.debug(result);
        let result_data = {};
        result_data['values'] = result;
        res.status(200).json(result_data);
    });
});

router.get('/q/:vender_name', function(req, res, next) {
    let cursor = db.find('menu', {'vender' : req.params.vender_name});
    let page = req.query.page;
    if(page !== undefined && page > 0){
        cursor = cursor.skip((page-1)*10).limit(10);
    }
    cursor.toArray(function(error, docments){
        if(error){
            let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(menu)', error.message);
            logger.error(error.message);
            next(new_err);
            return;
        }
        logger.debug(req.originalUrl + ' ' + docments);
        res.json(docments);
    });
});

router.get('/q/:vender_name/:dish_name', function(req, res, next) {
    let page = req.query.page;

    let selector = {'vender' : req.params.vender_name, 'dish': req.params.dish_name},
        cursor = db.find('menu', selector);
    
    if(page !== undefined && page > 0){
        cursor = cursor.skip((page-1)*10).limit(10);
    }

    cursor.toArray(function(error, docments){
        if(error){
            let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(menu)', error.message);
            logger.error(error.message);
            next(new_err);
            return;
        }
        logger.debug(req.originalUrl + ' ' + docments);
        res.json(docments);
    });
});

router.put('/q/:vender_name/:dish_name/rate', checkUserSessionIdHandler(false), 
    inputChecker({'rate':'number'}, true), function(req, res, next) {
    
    let selector = {'vender' : req.params.vender_name, 'dish': req.params.dish_name};
    let cursor = db.find('menu', selector);

    //FIXME, inconsistent with offical docs.
    cursor.toArray().then(function(result, error){

        if(error){
            let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(menu)', error.message);
            logger.error(error.message);
            next(new_err);
            return;
        }

        logger.debug(result);
        logger.debug(req.body);

        let times = result[0]['rate']['times'];
        let old_rate = result[0]['rate']['result'];
        let new_rate;

        new_rate = (times*old_rate + req.body['rate'])/(times+1);
        logger.debug('new rate is ' + new_rate);
        db.update('menu', selector, {'$set': {'rate':{'result':new_rate, 'times': (times+1)}}}, {})
            .then(function(update_result, error){
                if(error){
                    let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'UPDATE(menu)', error.message);
                    logger.error(error.message);
                    next(new_err);
                    return;
                }
                logger.debug(update_result);
                res.sendStatus(200);
            });

    });

});

module.exports = router;