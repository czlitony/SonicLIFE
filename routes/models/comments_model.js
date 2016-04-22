'use strict';
var db = require('../db');
var logger = require('../log').logger; 
var ObjectID = require('mongodb').ObjectID;
var APIError = require('../error').APIError,
    ErrorType = require('../error').ErrorType,
    Base = require('./base_model').Base;

exports.Comment = Comment;

function Comment(){
    this.collection_name = "comments";
}

Comment.prototype = Object.create(Base.prototype);
Comment.prototype.constructor = Comment;

Comment.prototype.insert = function(obj){

    let promise = new Promise(function(resolve, reject){

        if(obj.dish_id === undefined){
            reject(new APIError(ErrorType.NEED_A_ID))
            return;
        }

        db.find('menu', {'_id': ObjectID.createFromHexString(obj['dish_id'])}).toArray(function(error, documents){
            if(error){
                let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(menu)', error.message);
                logger.error(error.message);
                reject(new_err);
                return;
            }

            if(documents.length == 1){
                db.insert('comments', obj).
                    then(function(result, err){
                        if(err){
                            let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'INSERT(Comment)', err.message);
                            logger.error(err.message);
                            reject(new_err);
                            return;
                        }
                        logger.debug(result);
                        resolve(result['ops'][0]);
                    });
            }else{
                let error = new APIError(ErrorType.INVAILD_MENU_ID, item['dish_id']);
                logger.error(error.message);
                reject(error);
                return;
            }
        }); 
    });

    return promise;
}

// Comment.prototype.find = function(selector, skip, limit){
//     let promise = new Promise(function(resolve, reject){
//         let cursor = db.find('comments',selector);
//         if(skip){
//             cursor = cursor.skip(skip);
//         }

//         if(limit){
//             cursor = cursor.limit(limit);
//         }

//         cursor.toArray(function(error, documents){
//             if(error){
//                 let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(Comment)', error.message);
//                 logger.error(error.message);
//                 reject(new_err);
//                 return;
//             }

//             resolve(documents);
//         });
//     });

//     return promise;
// }