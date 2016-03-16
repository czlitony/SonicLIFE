'use strict';
var db = require('./db');
var logger = require('./log').logger; 
var ObjectID = require('mongodb').ObjectID;
var APIError = require('./error').APIError,
    ErrorType = require('./error').ErrorType;

exports.Schedule = Schedule;
exports.Comment = Comment;
exports.Order = Order;

function Schedule(){
    // this.db = db;
}

Schedule.prototype.find = function(target, skip, limit){
    let cursor = db.find('schedule', target);

    if(skip){
        cursor = cursor.skip(skip);
    }

    if(limit){
        cursor = cursor.limit(limit);
    }

    let promise = new Promise(function(resolve, reject){

        cursor.toArray(function(error, documents){
            if(error){
                let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(schedule)', error.message);
                logger.error(error.message);
                reject(new_err);
                return;
            }
            logger.debug("schedule: "+documents);

            let raw_list = [];
            if(documents instanceof Array){
                for (var i = documents.length - 1; i >= 0; i--) {
                    raw_list.push(documents[i]['dish_id']);
                }
            }else{
                raw_list.push(documents['dish_id']);
            }
            logger.debug("raw_list: "+raw_list);
            let translated_list = [];
            let a_tracker = '';
            try{
                for(let i=0; i<raw_list.length; i++){
                    a_tracker = raw_list[i];
                    translated_list.push(ObjectID.createFromHexString(a_tracker));
                }
            }catch(e){
                let error = new APIError(ErrorType.CAN_NOT_CREATE_OBJECTID, a_tracker);
                logger.error(error.message);
                reject(error);
                return;
            }

            let ref_map = {};
            let cursor = db.find('menu', {'_id': {'$in' : translated_list}});

            cursor.toArray(function(error, documents2){
                if(error){
                    let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(menu)', error.message);
                    logger.error(error.message);
                    reject(new_err);
                    return;
                }

                if(documents2 instanceof Array){
                    for (var i = documents2.length - 1; i >= 0; i--) {
                        ref_map[documents2[i]['_id'].toHexString()] = {'vender':documents2[i]['vender'], 'dish' : documents2[i]['dish']};
                    }
                }else{
                    ref_map[documents2['_id'].toHexString()] = {'vender':documents2['vender'], 'dish' : documents2['dish']};
                }

                let final_result = documents;
                if(final_result instanceof Array){
                    for (var i = final_result.length - 1; i >= 0; i--) {
                        // final_result[i].update(ref_map[final_result[i]['dish_id']]);
                        final_result[i] = Object.assign(final_result[i], ref_map[final_result[i]['dish_id']]);
                    }
                }else{
                    // final_result.update(ref_map[final_result['dish_id']]);
                    final_result = Object.assign(final_result, ref_map[final_result['dish_id']]);
                }         
                resolve(final_result);
            });
        });
    });

    return promise;
}

function Comment(){

}

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

Comment.prototype.find = function(selector, skip, limit){
    let promise = new Promise(function(resolve, reject){
        let cursor = db.find('comments',selector);
        if(skip){
            cursor = cursor.skip(skip);
        }

        if(limit){
            cursor = cursor.limit(limit);
        }

        cursor.toArray(function(error, documents){
            if(error){
                let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(Comment)', error.message);
                logger.error(error.message);
                reject(new_err);
                return;
            }

            resolve(documents);
        });
    });

    return promise;
}

function Order(){}

Order.prototype.find = function(selector, skip, limit){
    let cursor = db.find('order', selector);

    if(skip){
        cursor = cursor.skip(skip);
    }

    if(limit){
        cursor = cursor.limit(limit);
    }

    let promise = new Promise(function(resolve, reject){

        cursor.toArray(function(error, documents){
            if(error){
                let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(order)', error.message);
                logger.error(error.message);
                reject(new_err);
                return;
            }
            logger.debug("order: "+documents);

            let raw_list = [];
            if(documents instanceof Array){
                for (var i = documents.length - 1; i >= 0; i--) {
                    raw_list.push(documents[i]['dish_id']);
                }
            }else{
                raw_list.push(documents['dish_id']);
            }
            logger.debug("raw_list: "+raw_list);
            let translated_list = [];
            let a_tracker = '';
            try{
                for(let i=0; i<raw_list.length; i++){
                    a_tracker = raw_list[i];
                    translated_list.push(ObjectID.createFromHexString(a_tracker));
                }
            }catch(e){
                let error = new APIError(ErrorType.CAN_NOT_CREATE_OBJECTID, a_tracker);
                logger.error(error.message);
                reject(error);
                return;
            }

            let ref_map = {};
            let cursor = db.find('menu', {'_id': {'$in' : translated_list}});

            cursor.toArray(function(error, documents2){
                if(error){
                    let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(menu)', error.message);
                    logger.error(error.message);
                    reject(new_err);
                    return;
                }

                if(documents2 instanceof Array){
                    for (var i = documents2.length - 1; i >= 0; i--) {
                        ref_map[documents2[i]['_id'].toHexString()] = {'vender':documents2[i]['vender'], 'dish' : documents2[i]['dish']};
                    }
                }else{
                    ref_map[documents2['_id'].toHexString()] = {'vender':documents2['vender'], 'dish' : documents2['dish']};
                }

                let final_result = documents;
                if(final_result instanceof Array){
                    for (var i = final_result.length - 1; i >= 0; i--) {
                        // final_result[i].update(ref_map[final_result[i]['dish_id']]);
                        final_result[i] = Object.assign(final_result[i], ref_map[final_result[i]['dish_id']]);
                    }
                }else{
                    // final_result.update(ref_map[final_result['dish_id']]);
                    final_result = Object.assign(final_result, ref_map[final_result['dish_id']]);
                }         
                resolve(final_result);
            });
        });
    });

    return promise;
}

Order.prototype.insert = function(obj){
    let promise = new Promise(function(resolve, reject){

        if(obj.dish_id === undefined){
            reject(new APIError(ErrorType.NEED_A_ID))
            return;
        }

        try{
            var translated_id = ObjectID.createFromHexString(obj['dish_id']);
        }catch(e){
            let error = new APIError(ErrorType.CAN_NOT_CREATE_OBJECTID, obj['dish_id']);
            logger.error(e.message);
            reject(error);
            return;
        }

        db.find('order', {'dish_id':obj['dish_id'],'username':obj['username'],'type':obj['type'],'expired':false}).toArray(function(error, documents){
            if(error){
                let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(menu)', error.message);
                logger.error(error.message);
                reject(new_err);
                return;
            }    
            if(documents.length == 1){
                let new_err = new APIError(ErrorType.HAVE_ORDERED);
                logger.error(obj.username + " has already ordered.");
                reject(new_err);
                return;  
            }
            db.find('menu', {'_id': translated_id}).toArray(function(error, documents){
                if(error){
                    let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(menu)', error.message);
                    logger.error(error.message);
                    reject(new_err);
                    return;
                }

                if(documents.length == 1){
                    obj = Object.assign(obj, {dish : documents[0]['dish'], 
                                                vender : documents[0]['vender']});
                    db.insert('order', obj).
                        then(function(result, err){
                            if(err){
                                let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'INSERT(order)', err.message);
                                logger.error(err.message);
                                reject(new_err);
                                return;
                            }
                            logger.debug(result);
                            let final_result = result['ops'][0];
                            resolve(final_result);
                        });
                }else{
                    let error = new APIError(ErrorType.INVAILD_MENU_ID, obj['dish_id']);
                    logger.error(error.message);
                    reject(error);
                    return;
                }
            });
        });

         
    });

    return promise;
}

Order.prototype.delete = function(obj){
    let promise = new Promise(function(resolve, reject){

    });
}
