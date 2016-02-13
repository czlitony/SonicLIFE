'use strict';
var express = require('express');
var router = express.Router();
var db = require('./db');
var logger = require('./log').logger; 
var ObjectID = require('mongodb').ObjectID;
var APIError = require('./error').APIError,
    ErrorType = require('./error').ErrorType;
var checkInputHandler = require('./util').checkInputHandler;
var checkUserSessionIdHandler = require('./util').checkUserSessionIdHandler;

// router.get('/vender', checkUserSessionIdHandler(true), function(req, res, next) {

//     let promise_result = db.findDistinct('menu','vender');
//     promise_result.then(function(result,err){
//          if(err){
//             let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND_DISTINCT(menu)', err.message);
//             logger.error(err.message);
//             next(new_err);
//             return;
//         }
//         logger.debug(result);
//         let result_data = {};
//         result_data['values'] = result;
//         res.status(200).json(result_data);
//     });
// });

//NOTE: give anonymous functions a name is good for debug.
/*router.post('/menu/add', checkUserSessionIdHandler(true), checkInputHandler(['vender','dish'], true), function(req, res, next){

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
    });

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

router.delete('/menu/:dish_id', checkUserSessionIdHandler(true), function(req,res,next){
    logger.debug('dish_id is ' + req.params.dish_id);
    db.remove('menu', {'_id':ObjectID.createFromHexString(req.params.dish_id)})
        .then(function(result, error){
            logger.debug(result);
            logger.debug(error);
            if(error){
                let error = new APIError(ErrorType.DB_OPERATE_FAIL, 'REMOVE(menu)', err.message);
                logger.error(error.message);
                next(error);
                return;
            }
            res.sendStatus(200);
        });
});*/

module.exports = router;