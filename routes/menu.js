var express = require('express');
var router = express.Router();
// var uuid = require('node-uuid'); 
var CACHE = require('./cache').cache;
var db = require('./db');
var logger = require('./log').logger;  

var checkInputHandler = require('./util').checkInputHandler,
    checkUserSessionIdHandler = require('./util').checkUserSessionIdHandler;

router.param('id', checkUserSessionIdHandler);

router.get('/:id/:vender_name', 
    function(req, res, next) {
    var cursor = db.find('menu', {'vender' : req.params.vender_name});

    cursor.toArray(function(error, docments){
        if(error){
            logger.error(error.message);
            error.status = 401;
            next(error);
            return;
        }
        logger.debug(req.originalUrl + ' ' + docments);
        res.json(docments);
    });
});

router.get('/:id/:vender_name/:dish_name', function(req, res, next) {

    var selector = {'vender' : req.params.vender_name, 'dish': req.params.dish_name},
        cursor = db.find('menu', selector);

    cursor.toArray(function(error, docments){
        if(error){
            logger.error(error.message);
            error.status = 401;
            next(error);
            return;
        }
        logger.debug(req.originalUrl + ' ' + docments);
        res.json(docments);
    });
});

router.put('/:id/:vender_name/:dish_name/rate', checkInputHandler(['rate'], true), function(req, res, next) {
    
    var selector = {'vender' : req.params.vender_name, 'dish': req.params.dish_name};
    var cursor = db.find('menu', selector);

    //FIXME, inconsistent with offical docs.
    cursor.toArray().then(function(result, error){

        if(error){
            logger.error(error.message);
            error.status = 401;
            next(error);
            return;
        }

        logger.debug(result);
        logger.debug(req.body);

        var times = result[0]['rate']['times'];
        var old_rate = result[0]['rate']['result'];
        var new_rate;
        if(req.body['rate'] !== undefined && typeof req.body['rate'] === 'number'){
            new_rate = (times*old_rate + req.body['rate'])/(times+1);
            logger.debug('new rate is ' + new_rate);
            db.update('menu', selector, {'$set': {'rate':{'result':new_rate, 'times': (times+1)}}}, {})
                .then(function(update_result, error){
                    if(error){
                        logger.error(error.message);
                        error.status = 401;
                        next(error);
                        return;
                    }
                    logger.debug(update_result);
                    res.status(200).send();
                });
        }else{
            var error = new Error('rate not existed, or a wrong type.')
            logger.error(error.message);
            error.status = 401;
            next(error);
            return;
        }
    });

});

router.use(function(err, req, res, next){
    console.error(err);
    res.status(err.status).json({'message' : err.message});
});

module.exports = router;