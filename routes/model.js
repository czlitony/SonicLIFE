'use strict';
var db = require('./db');
var logger = require('./log').logger; 
var ObjectID = require('mongodb').ObjectID;
var APIError = require('./error').APIError,
    ErrorType = require('./error').ErrorType;

exports.Schedule = Schedule;

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