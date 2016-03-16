'use strict';
var express = require('express');
var router = express.Router();
var APIError = require('./error').APIError,
    ErrorType = require('./error').ErrorType;
var db = require('./db');
var logger = require('./log').logger;  

var checkInputHandler = require('./util').checkInputHandler,
    checkUserSessionIdHandler = require('./util').checkUserSessionIdHandler;

var Order = require('./model').Order;
// router.param('id', checkUserSessionIdHandler(false));

router.get('/', checkUserSessionIdHandler(false), function(req, res, next) {
    let s = new Order();
    
    let from = req.query.from;
    let to = req.query.to;
    let page = req.query.page;

    logger.debug('from ' + from);
    logger.debug('to ' + to);
    let selector = {'username' : req.session.sessionState['username']};
    if(from && to){
        selector = {'datetime' : {'$gt' : from , '$lt' : to}, 'username' : req.session.sessionState['username']};
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

router.post('/', checkUserSessionIdHandler(false), checkInputHandler(['dish_id','type'], true), function(req, res, next){
    let s = new Order();

    let target = {
        dish_id : req.body['dish_id'],
        username : req.session.sessionState['username'],
        datetime : new Date(),
        expired : false,
        type : req.body['type']
    }

    s.insert(target).then(function(val){
        res.status(200).json(val);
    }).catch(function(err){
        next(err);
    })
})

router.delete('/', checkUserSessionIdHandler(false), checkInputHandler(['order_id'], true), function(req, res, next){

});

module.exports = router;