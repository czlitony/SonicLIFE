'use strict';
var db = require('../db');
var logger = require('../log').logger; 
var ObjectID = require('mongodb').ObjectID;
var APIError = require('../error').APIError,
    ErrorType = require('../error').ErrorType;

exports.Menu = Menu;

function Menu(){
    // this.db = db;
}

Menu.prototype.find = function(selector, skip, limit){
    let promise = new Promise(function(resolve, reject){
        logger.debug("menu_model in");
        let cursor = db.find('menu', selector);
        logger.debug("menu_model out");

        if(skip){
            cursor = cursor.skip(skip);
        }

        if(limit){
            cursor = cursor.limit(limit);
        }

        cursor.toArray(function(error, documents){
            if(error){
                let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(Menu)', error.message);
                logger.error(error.message);
                reject(new_err);
                return;
            }
            logger.debug("Menu.prototype.find " + JSON.stringify(documents));
            resolve(documents);
        });
    });

    return promise;
}