'use strict';
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logon = require('./routes/logon');
var menu = require('./routes/menu');
var schedule = require('./routes/schedule');
var rule = require('./routes/rule');
var commets = require('./routes/commets');
var order = require('./routes/order');
var log = require('./routes/log');
var session = require('express-session');
var APIError = require('./routes/error').APIError;
var ErrorType = require('./routes/error').ErrorType;

var app = express();
log.use(app); 

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//Here we need another Storage to cache the sessions, MemoryStore is not suitable for production.
app.use(session({
  secret: '!@#$%^&**',
  resave: false,
  saveUninitialized: false,
  //If set secure = true, you have to use HTTPS, otherwise you can't get a set-cookie response.
  cookie: { secure: false }
}))

app.use('/__api__/logon', logon);
app.use('/__api__/menu', menu);
app.use('/__api__/schedule', schedule);
app.use('/__api__/order', order);
app.use('/__api__/comment', commets);
app.use('/__api__/rule', rule);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new APIError(ErrorType.ROUTE_NOT_FOUND, req.originalUrl);
  next(err);
});

// error handlers
app.use(function(err, req, res, next) {
    if(err.toJSON){
        log.logger.error(err.toJSON());
        res.status(err.status).json(err.toJSON());
    }else{
        res.status(500).send(err.message);
    }
});


module.exports = app;
