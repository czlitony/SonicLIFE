var express = require('express');
var router = express.Router();
// var uuid = require('node-uuid'); 
var Cache = require('./cache');
var db = require('./db');
var logger = require('./log').logger;  

var check_request_content = require('./util').check_request_content;

router.get('/:id/vender', check_admin_session_id, function(req, res, next) {

    // result = db.find('menu',{'vender': req.params.vender_name});
    // result.toArray(function(err, documents){

    // });
    res.send('incomplete');
});

//NOTE: give anonymous functions a nanme is good for debug.
router.post('/:id/menu/:vender_name', check_admin_session_id, function(req, res, next){
    res.send('incomplete');
});

router.use(function(err, req, res, next){
    console.error(err);
    res.status(err.status).json({'message' : err.message});
});

function check_admin_session_id(req, res, next){
    logger.debug('restore my session');
    logger.debug(req.params.id);
    if (CACHE.restore(req.params.id)){
        var result = CACHE.restore(req.params.id);
    }else{
        logger.error("can't restore a session");
        //Jump to error handle.
        var err = new Error('Wrong session_id');
        err.status = 400;
        next(err);
        return;
    }

    if(result['role'] !== 'admin' || result['state'] !== true){
        var err = new Error('You are not an admin or unauthenticated.');
        err.status = 400;
        next(err);
        return;
    }

    next();
}

module.exports = router;