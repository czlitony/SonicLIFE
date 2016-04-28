'use strict';
var db = require('../db');
var logger = require('../log').logger; 
var ObjectID = require('mongodb').ObjectID;
var APIError = require('../error').APIError,
    ErrorType = require('../error').ErrorType,
    Menu = require('./menu_model').Menu;

exports.Base = Base;

function Base(){
    this.collection_name = "unkown";
}

Base.prototype.find = function(selector, skip, limit){
    let inst = this;

    let promise = new Promise(function(resolve, reject){
        if(inst.collection_name == "unkown"){
            let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND('+inst.collection_name+')', "collection_name in base model not been set.");
            logger.error("collection_name in base model not been set.");
            reject(new_err);
            return;
        }

        let cursor = db.find(inst.collection_name,selector);
        if(skip){
            cursor = cursor.skip(skip);
        }

        if(limit){
            cursor = cursor.limit(limit);
        }

        cursor.toArray(function(error, documents){
            if(error){
                let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND('+inst.collection_name+')', error.message);
                logger.error(error.message);
                reject(new_err);
                return;
            }

            resolve(documents);
        });
    });

    return promise;
}

Base.prototype.insert = function(obj){
    let inst = this;
    let promise = new Promise(function(resolve, reject){
        let promise_result = db.insert(inst.collection_name, obj);

        //FIXME: the input sequence is different with the offical document.
        //Offical docs: function(err, result)
        //Actual: function(result, err)
        promise_result.then(function(result){
            resolve(result['ops']);
        }).catch(function(err){
            reject(err);
        });
    });
    return promise;
}