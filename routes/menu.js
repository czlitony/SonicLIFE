'use strict';
var express = require('express');
var router = express.Router();
var db = require('./db');
var logger = require('./log').logger;  
var APIError = require('./error').APIError,
    ErrorType = require('./error').ErrorType;
var checkInputHandler = require('./util').checkInputHandler,
    checkUserSessionIdHandler = require('./util').checkUserSessionIdHandler;

router.get('/', function(req, res, next) {
    let cursor = db.find('menu', {});

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


router.get('/:vender_name', function(req, res, next) {
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

router.get('/:vender_name/:dish_name', function(req, res, next) {
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

router.put('/:vender_name/:dish_name/rate', checkUserSessionIdHandler(false), checkInputHandler(['rate'], true), function(req, res, next) {
    
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
        if(typeof req.body['rate'] === 'number'){
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
                    res.status(200).send();
                });
        }else{
            let error = new APIError(ErrorType.RATE_TYPE_ILLEGAL);
            logger.error(error.toJSON());
            next(error);
            return;
        }
    });

});

module.exports = router;