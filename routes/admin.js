'use strict';
var express = require('express');
var router = express.Router();
// var uuid = require('node-uuid'); 
var CACHE = require('./cache').cache;
var db = require('./db');
var logger = require('./log').logger; 
var ObjectID = require('mongodb').ObjectID

var checkInputHandler = require('./util').checkInputHandler;
var checkAdminSessionIdHandler = require('./util').checkAdminSessionIdHandler;

router.param('id', checkAdminSessionIdHandler);

router.get('/:id/vender', function(req, res, next) {

    let promise_result = db.findDistinct('menu','vender');
    promise_result.then(function(result,err){
         if(err){
            logger.error(err);
            err.status = 401;
            next(err);
            return;
        }
        logger.debug(result);
        let result_data = {};
        result_data['values'] = result;
        res.status(200).json(result_data);
    });
});

//NOTE: give anonymous functions a name is good for debug.
router.post('/:id/menu/add', checkInputHandler(['vender','dish'], true), function(req, res, next){

    let body = req.body;
    let data = {};
    data['vender'] = body['vender'];
    data['dish'] = body['dish'];

    db.find('menu', data).toArray(function(error, docments){
        if(error){
            logger.error(error.message);
            error.status = 401;
            next(error);
            return;
        }

        if(docments.length >= 1){
            var error = new Error('items existed.');
            logger.error(error.message);
            error.status = 401;
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
            logger.error(err);
            logger.debug(result);
            err.status = 401;
            next(err);
            return;
        }
        logger.debug(result);
        res.status(200).json(result['ops']);
    });
});

router.route('/:id/menu/:dish_id')
.delete(function(req,res,next){
    logger.debug('dish_id is ' + req.params.dish_id);
    db.remove('menu', {'_id':ObjectID.createFromHexString(req.params.dish_id)})
        .then(function(result, error){
            logger.debug(result);
            logger.debug(error);
            if(error){
                logger.error(error);
                logger.debug(result);
                error.status = 401;
                next(error);
                return;
            }
            res.sendStatus(200);
        });
});

router.get('/:id/:vender_name',  
    function(req, res, next) {
    res.redirect('/menu/' + req.params.vender_name);
});

router.use(function(err, req, res, next){
    console.error(err);
    res.status(err.status).json({'message' : err.message});
});

module.exports = router;