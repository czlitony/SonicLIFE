'use strict';
var db = require('../db');
var logger = require('../log').logger; 
var ObjectID = require('mongodb').ObjectID;
var APIError = require('../error').APIError,
    ErrorType = require('../error').ErrorType,
    Menu = require('./menu_model').Menu,
    Base = require('./base_model').Base,
    Rule = require('./rule_model').Rule;

exports.Schedule = Schedule;

function Schedule(){
    this.collection_name = "schedule";
}

Schedule.prototype = Object.create(Base.prototype);
Schedule.prototype.constructor = Schedule;

Schedule.prototype.generate = function(day){
    let promise = new Promise(function(resolve, reject){
        let rule = new Rule();

        rule.find({'day':day}).then(function(val){
            if(val instanceof Array && val.length != 0){
                val.forEach(function(item){
                    let vendor = item.menu;
                    let type = item.type;
                    let menu = new Menu();
                    
                    menu.find({'vender': vendor}).then(function(val){
                        let insertObj = {
                            'time' : new Date(),
                            'day' : day,
                            'type' : type,
                            'menu' : val
                        };

                        let schedule = new Schedule();
                        schedule.insert(insertObj).then(function(val){
                            logger.debug("Schedule.generate: Get a Result " + JSON.stringify(val));
                            //FIXME: Because we don't need to return any value, so we can call resolve first time 
                            //we got here, it may lead to a result which we can't get the err.
                            //IF we want to collec the result, we need to consider to use async.series
                            resolve();
                        }).catch(function(err){
                            reject(err);
                        });
                    }).catch(function(err){
                        reject(err);
                    });
                });

            }else{
                let error = new APIError(ErrorType.NO_RULE, day);
                reject(error);
            }
        }).catch(function(err){
            reject(err);
        });
    });

    return promise;
}

// Schedule.prototype.find = function(target, skip, limit){
//     let cursor = db.find('schedule', target);

//     if(skip){
//         cursor = cursor.skip(skip);
//     }

//     if(limit){
//         cursor = cursor.limit(limit);
//     }

//     let promise = new Promise(function(resolve, reject){

//         cursor.toArray(function(error, documents){
//             if(error){
//                 let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(schedule)', error.message);
//                 logger.error(error.message);
//                 reject(new_err);
//                 return;
//             }
//             logger.debug("schedule: " + documents);

//             resolve(documents);

//             // let raw_list = [];
//             // if(documents instanceof Array){
//             //     for (var i = documents.length - 1; i >= 0; i--) {
//             //         raw_list.push(documents[i]['dish_id']);
//             //     }
//             // }else{
//             //     raw_list.push(documents['dish_id']);
//             // }
//             // logger.debug("raw_list: "+raw_list);
//             // let translated_list = [];
//             // let a_tracker = '';
//             // try{
//             //     for(let i=0; i<raw_list.length; i++){
//             //         a_tracker = raw_list[i];
//             //         translated_list.push(ObjectID.createFromHexString(a_tracker));
//             //     }
//             // }catch(e){
//             //     let error = new APIError(ErrorType.CAN_NOT_CREATE_OBJECTID, a_tracker);
//             //     logger.error(error.message);
//             //     reject(error);
//             //     return;
//             // }

//             // let ref_map = {};
//             // let cursor = db.find('menu', {'_id': {'$in' : translated_list}});

//             // cursor.toArray(function(error, documents2){
//             //     if(error){
//             //         let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(menu)', error.message);
//             //         logger.error(error.message);
//             //         reject(new_err);
//             //         return;
//             //     }

//             //     if(documents2 instanceof Array){
//             //         for (var i = documents2.length - 1; i >= 0; i--) {
//             //             ref_map[documents2[i]['_id'].toHexString()] = {'vender':documents2[i]['vender'], 'dish' : documents2[i]['dish']};
//             //         }
//             //     }else{
//             //         ref_map[documents2['_id'].toHexString()] = {'vender':documents2['vender'], 'dish' : documents2['dish']};
//             //     }

//             //     let final_result = documents;
//             //     if(final_result instanceof Array){
//             //         for (var i = final_result.length - 1; i >= 0; i--) {
//             //             // final_result[i].update(ref_map[final_result[i]['dish_id']]);
//             //             final_result[i] = Object.assign(final_result[i], ref_map[final_result[i]['dish_id']]);
//             //         }
//             //     }else{
//             //         // final_result.update(ref_map[final_result['dish_id']]);
//             //         final_result = Object.assign(final_result, ref_map[final_result['dish_id']]);
//             //     }         
//             //     resolve(final_result);
//             // });
//         });
//     });

//     return promise;
// }

// Schedule.prototype.insert = function(body){
//     let ret_promise = new Promise(function(resolve, reject){

//         let menu_query_promise = new Promise(function(resolve, reject){
//             if(body.menu){
//                 for (var i = body.menu.length - 1; i >= 0; i--) {
//                     // let dishes_list = body.menu[i]['dishes'];

//                     for (var j = body.menu[i]['dishes'].length - 1; j >= 0; j--) {
//                         let m = new Menu();
//                         let menu_promise = m.find({'_id' : ObjectID.createFromHexString(body.menu[i]['dishes'][j])});

//                         //Async will cause this always be -1
//                         let tmp_i = i;
//                         let tmp_j = j;
//                         // FIXME
//                         menu_promise.then(function(value){
//                             body.menu[tmp_i]['dishes'][tmp_j] = value;
//                             logger.debug("Schedule.prototype.insert dish " + JSON.stringify(value));
//                             logger.debug("Schedule.prototype.insert dish " + tmp_i);
//                             logger.debug("Schedule.prototype.insert dish " + JSON.stringify(body.menu[tmp_i]));
//                         }).catch(function(err){
//                             let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND(menu)', err.message);
//                             logger.error(err.message);
//                             reject(new_err);
//                             return;
//                         });
//                     }
//                 }
//             }
//             resolve(body);
//         })

//         menu_query_promise.then(function(value){
//             logger.debug("Schedule.prototype.insert body " + JSON.stringify(value));
//             let promise_result = db.insert('schedule', value);

//             promise_result.then(function(result, err){
//                 if(err){
//                     let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'INSERT(schedule)', err.message);
//                     logger.error(err.message);
//                     // next(new_err);
//                     reject(err);
//                     return;
//                 }
//                 logger.debug(result);
//                 resolve(result['ops']);
//                 // res.status(200).json(result['ops']);
//             });
//         }).catch(function(err){
//             reject(err);
//             return;
//         });
//     })

//     return ret_promise;
// }

// Schedule.prototype.findDistinct = function(element_name){
//     let ret_promise = new Promise(function(resolve, reject){
//         db.findDistinct(element_name).then(function(result, err){
//              if(err){
//                 let new_err = new APIError(ErrorType.DB_OPERATE_FAIL, 'FIND_DISTINCT(menu)', err.message);
//                 logger.error(err.message);
//                 reject(new_err);
//                 return;
//             }
//             logger.debug(result);
//             let result_data = {};
//             result_data['values'] = result;
//             resolve(result_data);
//         });  
//     });

//     return ret_promise;
// }