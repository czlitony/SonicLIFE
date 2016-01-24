var express = require('express');
var router = express.Router();
// var uuid = require('node-uuid'); 
var CACHE = require('./cache').cache;
var db = require('./db');
var logger = require('./log').logger;  

var check_input_handler = require('./util').check_input_handler;
var check_admin_session_id_handler = require('./util').check_admin_session_id_handler;

router.get('/:id/vender', check_admin_session_id_handler, function(req, res, next) {

    var promise_result = db.findDistinct('menu','vender');
    promise_result.then(function(result,err){
         if(err){
            logger.error(err);
            err.status = 401;
            next(err);
            return;
        }
        logger.debug(result);
        var result_data = {};
        result_data['values'] = result;
        res.status(200).json(result_data);
    });
});

//NOTE: give anonymous functions a name is good for debug.
router.post('/:id/menu/add', 
    check_admin_session_id_handler, 
    check_input_handler(['vender','dish']), 
    function(req, res, next){

    body = req.body;
    var data = {};
    data['vender'] = body['vender'];
    data['dish'] = body['dish'];
    data['rate'] = { 'times': 0, 'result': 0 };
    var promise_result = db.insert('menu', data);
    // promise_result.then(function(err, result){
    //     logger.debug(result);
    //     res.status(200).json();
    // }).catch(function(err){
    //     logger.error(err);
    //     logger.debug(result);
    //     err.status = 401;
    //     next(err);
    //     return;
    // });

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

router.get('/:id/menu/:vender_name', 
    check_admin_session_id_handler, 
    function(req, res, next) {
    res.redirect('/order/'+ req.params.id + '/menu/' + req.params.vender_name);
});

router.use(function(err, req, res, next){
    console.error(err);
    res.status(err.status).json({'message' : err.message});
});

module.exports = router;