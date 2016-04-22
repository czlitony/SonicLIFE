'use strict';
var db = require('../db');
var logger = require('../log').logger; 
var ObjectID = require('mongodb').ObjectID;
var APIError = require('../error').APIError,
    ErrorType = require('../error').ErrorType,
    Menu = require('./menu_model').Menu,
    Base = require('./base_model').Base;

exports.Rule = Rule;

function Rule(){
    this.collection_name = "rule";
}

Rule.prototype = Object.create(Base.prototype);
Rule.prototype.constructor = Rule;

Rule.prototype.insert = function(obj){
    let inst = this;

    let promise = new Promise(function(resolve, reject){

        db.find(inst.collection_name, {'type' : obj['type'], 'day' : obj['day']}).toArray(function(error, docments){
            if(error){
                let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND('+inst.collection_name+')', error.message);
                logger.error(error.message);
                reject(new_err);
                return;
            }

            if(docments.length >= 1){
                let error = new APIError(ErrorType.RULE_EXIST, JSON.stringify({'type' : obj['type'], 'day' : obj['day']}));
                logger.error(error.message);
                reject(error);
                return;
            }
            
            var promise_result = db.insert(inst.collection_name, obj);

            //FIXME: the input sequence is different with the offical document.
            //Offical docs: function(err, result)
            //Actual: function(result, err)
            promise_result.then(function(result, err){
                if(err){
                    let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'INSERT('+inst.collection_name+')', err.message);
                    logger.error(err.message);
                    reject(new_err);
                    return;
                }
                logger.debug(result);
                resolve(result['ops']);
            });
        });
    });

    return promise;
}

Rule.prototype.delete = function(){

}

Rule.prototype.update = function(){

}
