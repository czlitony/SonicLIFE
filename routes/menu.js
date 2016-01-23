var express = require('express');
var router = express.Router();
// var uuid = require('node-uuid'); 
var Cache = require('./cache');
var db = require('./db');
var logger = require('./log').logger;  

var check_request_content = require('./util').check_request_content;

router.get('/:id', function(req, res, next) {

    res.send('incomplete');
});

module.exports = router;