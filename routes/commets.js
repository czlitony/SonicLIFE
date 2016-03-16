'use strict';
var express = require('express');
var router = express.Router();
var db = require('./db');
var logger = require('./log').logger; 
var ObjectID = require('mongodb').ObjectID;
var APIError = require('./error').APIError,
    ErrorType = require('./error').ErrorType;
var checkInputHandler = require('./util').checkInputHandler,
    checkUserSessionIdHandler = require('./util').checkUserSessionIdHandler,
    genericQuery = require('./util').genericQuery;

var Comment = require('./models/comments_model').Comment;

module.exports = router;

router.get('/:dish_id', function(req, res, next){

    let page = req.query.page;
    let dish_id = req.params.dish_id;
    let comment = new Comment();
    let promise;
    let selector = {'dish_id' : dish_id};
    
    if(page !== undefined && page > 0){      
        promise = comment.find(selector, ((page-1)*10), 10);
    }else{
        promise = comment.find(selector);
    }

    promise.then(function(val){
        res.status(200).json(val);
    }).catch(function(err){
        next(err);
    });
});

router.post('/', checkUserSessionIdHandler(false), checkInputHandler(['comment','dish_id'], true), function(req, res, next){
    let msg = req.body['comment'];
    let dish_id = req.body['dish_id'];
    let comment = new Comment();
    let target = {
        'dish_id' : dish_id,
        'comment' : msg,
        'datetime' : new Date(),
        'username' : req.session.sessionState['username']
    }

    comment.insert(target).then(function(val){
        res.status(200).json(val);
    }).catch(function(err){
        next(err);
    })

})