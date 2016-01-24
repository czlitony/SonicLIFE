var express = require('express');
var router = express.Router();
// var uuid = require('node-uuid'); 
var CACHE = require('./cache').cache;
var db = require('./db');
var logger = require('./log').logger;  

var check_input_handler = require('./util').check_input_handler;
var check_user_session_id_handler = require('./util').check_user_session_id_handler;

router.get('/:id/menu/:vender_name', 
    check_user_session_id_handler, 
    function(req, res, next) {
    var cursor = db.find('menu', {'vender' : req.params.vender_name});

    cursor.toArray(function(error, docments){
        if(error){
            logger.error(error.message);
            error.status = 401;
            next(error);
            return;
        }
        logger.debug(docments);
        res.json(docments);
    });
});

router.post('/:id/menu/:vender_name/:dish_name/rate', 
    check_user_session_id_handler, 
    check_input_handler(['rate']), 
    function(req, res, next) {
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
        if(req.body['rate'] !== undefined){
            new_rate = (times*old_rate + req.body['rate'])/(times+1);
            logger.debug('new rate is ' + new_rate);
            db.update('menu', selector, 
                    {'$set': {'rate':{'result':new_rate, 'times': (times+1)}}}, {})
                .then(function(update_result, error){
                    if(error){
                        logger.error(error.message);
                        error.status = 401;
                        next(error);
                        return;
                    }
                    logger.debug(update_result);
                    res.json(update_result);
                });
        }else{
            var error = new Error('rate not existed.')
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