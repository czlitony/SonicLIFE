'use strict';
var db = require('../db');
var logger = require('../log').logger; 
var ObjectID = require('mongodb').ObjectID;
var APIError = require('../error').APIError,
    ErrorType = require('../error').ErrorType,
    Base = require('./base_model').Base;

exports.Menu = Menu;

function Menu(){
    this.collection_name = "menu";
}

Menu.prototype = Object.create(Base.prototype);
Menu.prototype.constructor = Menu;