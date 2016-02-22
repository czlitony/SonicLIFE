'use strict';
var express = require('express');
var router = express.Router();
// var uuid = require('node-uuid'); 
//var CACHE = require('./cache').cache;
var APIError = require('./error').APIError,
    ErrorType = require('./error').ErrorType;
var db = require('./db');
var logger = require('./log').logger;  

var checkInputHandler = require('./util').checkInputHandler,
    checkUserSessionIdHandler = require('./util').checkUserSessionIdHandler;

// router.param('id', checkUserSessionIdHandler(false));

router.get('/', function(req, res, next) {
    res.send();
});

module.exports = router;