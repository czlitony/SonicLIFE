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
    genericQuery = require('./util').genericQuery,
    Menu = require('./models/menu_model').Menu,
    Rule = require('./models/rule_model').Rule;

module.exports = router;

router.get('/', checkUserSessionIdHandler(true), genericQuery('rule'));

router.post('/', checkUserSessionIdHandler(true), 
    inputChecker({'menu':'string','type':'string','day':'number'}, true), function(req, res, next){

    let menu = new Menu();
    menu.find({'vender' : req.body['menu']}).then(function(val){
        if(val.length > 0){
            let rule = new Rule();
            rule.insert(req.body).then(function(val){
                res.status(200).json(val[0]);
            }).catch(function(err){
                next(err);
                return;
            });
        }else{
            let new_err = new APIError(ErrorType.INVAILD_VENDOR_NAME, req.body['menu']);
            logger.Error("Can't find the vender" + req.body['menu'] +" while adding a Rule.");
            next(new_err);
            return;
        }
        // 
        // res.status(200).json(val);
    }).catch(function(err){
        next(err);
    });

});